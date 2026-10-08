import assert from 'node:assert/strict';

// Exact three R03 controls from the frozen63 static fixture. These are supplied
// malformed data, never a published Product or admitted runtime observation.
export function originalGraphLawPackets(gtl, corpus) {
  const source = corpus.programs[0].packet;
  const baseline = structuredClone(source.publication);
  const graph = baseline.graphFunctions[0];
  baseline.contributions = [gtl.catalogContribution({handle: graph.name,
    kind: 'graph_function', declarationOrContractRef: graph.name,
    owningProductId: baseline.owningProductId,
    programMembershipRefs: [baseline.programs[0].programRef],
    readinessPrerequisiteRefs: [baseline.programs[0].programRef],
    compatibilityRefs: [], provenanceRefs: [baseline.artifactDigest]})];
  function addNode(publication, label, duplicate = false) {
    const g = publication.graphFunctions[0], seed = g.template.nodes[0];
    const node = structuredClone(seed);
    node.nodeRef = duplicate ? seed.nodeRef : `${seed.nodeRef}/${label}`;
    node.term.programLocusRef += `/${label}`; node.term.armId += `/${label}`;
    if (!duplicate) {
      const binding = publication.implementationBindings.find(
        row => row.bindingRef === seed.term.requirement.implementationBindingRef);
      assert.ok(binding);
      const extra = {...binding, bindingRef: `${binding.bindingRef}/${label}`,
        implementationRef: `${binding.implementationRef}/${label}`,
        inputContractRef: seed.term.outputCarrierRef};
      publication.implementationBindings.push(extra);
      node.term.inputCarrierRef = seed.term.outputCarrierRef;
      node.term.requirement.inputContractRef = seed.term.outputCarrierRef;
      node.term.requirement.implementationBindingRef = extra.bindingRef;
    }
    g.template.nodes.push(node); return node;
  }
  return [
    ['duplicate-node', pub => addNode(pub, 'duplicate', true)],
    ['terminal-outgoing', pub => {
      const g = pub.graphFunctions[0], n = addNode(pub, 'after-terminal');
      g.template.edges = [gtl.graphEdge({fromNodeRef: g.template.startNodeRef, toNodeRef: n.nodeRef})];
      g.template.terminalNodeRefs.push(n.nodeRef);
    }],
    ['ordinary-double-edge', pub => {
      const g = pub.graphFunctions[0], nodes = [addNode(pub, 'branch-a'), addNode(pub, 'branch-b')];
      g.template.edges = nodes.map(n => gtl.graphEdge({fromNodeRef: g.template.startNodeRef, toNodeRef: n.nodeRef}));
      g.template.terminalNodeRefs = nodes.map(n => n.nodeRef);
    }],
  ].map(([id, mutate]) => {
    const publication = structuredClone(baseline); mutate(publication);
    return {id, packet: {...structuredClone(source), publication}};
  });
}
