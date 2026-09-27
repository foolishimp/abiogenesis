import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import * as product from '@abiogenesis/typescript-tenant/product';
import * as gtl from '@abiogenesis/typescript-tenant/gtl';
import {constructProgramConstructionLibrary} from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/src/program-construction.mjs';
import {ids} from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/src/program-construction-contracts.mjs';
import {evaluatorPublication} from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test/fixtures/program-construction/native-records-evaluator.mjs';
const started=performance.now();
const prior=JSON.parse(await readFile('/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/pc05-01/packages/construction/build/publication.json','utf8'));
const z='sha256:'+'0'.repeat(64),artifact={productId:product.ABI5_PRODUCT_ID,packageName:product.ABI5_PACKAGE_NAME,
  packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:z,productContentDigest:z,manifestDigest:z,productManifestDigest:z};
const evaluator=evaluatorPublication({gtl,artifact});
const publication=constructProgramConstructionLibrary({gtl,product,artifact,includeNativeConstruction:true,
  evaluationGraph:evaluator.graphFunctions[0],includeAssessment:true});
const selected=[ids.constructionChildGraphFunctionRef,ids.evaluationChildGraphFunctionRef,ids.assessmentChildGraphFunctionRef];
const projection=selected.map(ref=>{
  const graph=publication.graphFunctions.find(g=>g.name===ref),old=prior.graphFunctions.find(g=>g.name===ref);
  assert(graph&&old);assert.equal(old.declarations['abg.failure_contract'],undefined);
  const expected=structuredClone(old);expected.declarations['abg.failure_contract']=ids.failureContractRef;
  assert.deepEqual(graph,expected,'exact installed child changes only the missing callable failure declaration');
  const leaves=graph.template.nodes.flatMap(n=>gtl.cLeafTerms(n.term));assert.equal(leaves.length,0);
  const failures=publication.contracts.filter(c=>c.contractRef===graph.declarations['abg.failure_contract']);
  assert.equal(failures.length,1);assert.equal(failures[0].contractKind,'failure');
  assert.deepEqual(failures[0],prior.contracts.find(c=>c.contractRef===failures[0].contractRef),'reuse original owned failure contract');
  const closure=publication.closureContracts.find(c=>c.closureContractRef===graph.declarations['abg.child_closure_contract']);
  assert.deepEqual(closure,prior.closureContracts.find(c=>c.closureContractRef===closure.closureContractRef));
  return {graphFunctionRef:ref,priorDigest:product.sha256Canonical(old),currentDigest:product.sha256Canonical(graph),
    localExecutableRowCount:0,failureContractRef:failures[0].contractRef,failureContractKind:failures[0].contractKind,
    closureRejectionRef:closure.rejectionContractRef,innerCalls:graph.template.nodes.map(n=>n.term.graphFunctionRef)};
});
console.log(JSON.stringify({status:'pure_declaration_projection_passed',coreRoot:process.env.ABI5_COMPONENT_ROOT,
  projection,elapsedMs:performance.now()-started,
  limits:'Static publication/own-row relation only; no admitted ImplementationSet, workflow opening, failure foldback or installed execution is claimed.'},null,2));
