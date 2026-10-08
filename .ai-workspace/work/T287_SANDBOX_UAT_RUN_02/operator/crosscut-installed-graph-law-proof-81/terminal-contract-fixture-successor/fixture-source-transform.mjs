import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const marker="graphFunctions.push(normalizeGraph,projectGraph,parent);addProgram(GRAPH_EDGE_IDS,[parent.name]);",fragment="\n    // Finite external fixture RUN closure follows its actual terminal Project contracts.\n    const graphEdgeRunClosureIndex=closures.findIndex(row=>row.closureContractRef===GRAPH_EDGE_IDS.closureContractRef&&row.closureScope==='run');\n    const terminalProjectNode=parent.template.nodes.find(row=>parent.template.terminalNodeRefs.includes(row.nodeRef));\n    const terminalProjectTerm=terminalProjectNode.term;\n    const terminalProjectBinding=bindings.find(row=>row.bindingRef===terminalProjectTerm.requirement.implementationBindingRef);\n    closures[graphEdgeRunClosureIndex]=gtl.closureContract({...closures[graphEdgeRunClosureIndex],\n      evidenceContractRef:terminalProjectTerm.requirement.evidenceContractRef,\n      judgmentContractRef:terminalProjectTerm.requirement.judgmentContractRef,\n      refusalContractRef:terminalProjectBinding.refusalContractRef,\n      rejectionContractRef:terminalProjectBinding.refusalContractRef});\n";
export function sourceTransform(name,source){
 if(name!=='program.mjs')return source;
 assert.equal(Buffer.byteLength(source),22919);
 assert.equal(createHash('sha256').update(source).digest('hex'),"6591f179666eeec55f14930ebd4b96f7c05d494b2c619be4d790207c691a1218");
 assert.equal(source.split(marker).length-1,1);
 return source.replace(marker,marker+fragment);
}
