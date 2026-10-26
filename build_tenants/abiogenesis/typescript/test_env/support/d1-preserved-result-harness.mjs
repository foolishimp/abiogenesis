import assert from 'node:assert/strict';
import * as product from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import * as recovery from '../../build/code/src/abg/worksite_construction_recovery.js';
import {evidenceInput} from './evidence-root.mjs';
export {product,gtl,validator,recovery};
// The D1 preserved-result record's source observation is historical evidence
// under the evidence root; without the root the cases that need it skip with
// its reason. The native event store it names lies in another repository's
// test runs, outside the root: no case here reads that store.
export const D1_PRESERVED_RECORD='comments/codex/20260909_D1_LIFECYCLE/native-stage-implementation-01/preserved-result-implementation-01/';
export const sourceObservationInput=evidenceInput({path:D1_PRESERVED_RECORD+'preimages/source-observation.json',
  sha256:'c03f587f370f8ce9b34a2fc9f0b275493926eac78e21114c3de350c40b6b6c85',bytes:9988});
export const sourceObservationSkip=sourceObservationInput.kind==='absent'&&sourceObservationInput.reason;
export const sourceObservation=sourceObservationInput.kind==='present'?JSON.parse(sourceObservationInput.bytes.toString('utf8')):null;
export const selector=sourceObservation&&product.constructWorksitePreservedResultSource({kind:'worksite_preserved_result_source',schemaVersion:'5.0.0',
  historicalPrefix:sourceObservation.nativeEventStore.coordinate,sourceCCallRef:sourceObservation.nativeSource.cCallRef,
  actorInvocationRef:sourceObservation.nativeSource.actorInvocationRef});
const h=n=>'sha256:'+String(n).repeat(64);
// Static declarations with explicit, uninstalled artifact coordinates. Catalog
// readiness below is a lookup assumption, never CatalogOperationPort admission.
export function staticDeclarations(graphTransform=graph=>graph){
  const artifact={productId:product.ABI5_PRODUCT_ID,artifactDigest:h(1),productContentDigest:h(2),
    productManifestDigest:h(3),packageName:product.ABI5_PACKAGE_NAME,packageVersion:product.ABI5_PACKAGE_VERSION};
  const native=gtl.constructWorksiteConstructionModulePublication(artifact),ids=product.WORKSITE_CONSTRUCTION_IDS;
  const graph=graphTransform(gtl.constructWorksitePreservedResultRecoveryGraphFunction({
    graphFunctionRef:'graph-function://d1-preserved-mechanical/recovery@5',source:selector}));
  const oldProgram=native.programs.find(p=>p.programRef===ids.programRef);
  let program={...oldProgram,programRef:'program://d1-preserved-mechanical/recovery@5',moduleRef:'module://d1-preserved-mechanical/recovery@5',
    starts:[{startRef:'start://d1-preserved-mechanical/recovery@5',graphFunctionRef:graph.name}],
    callableMembership:oldProgram.callableMembership.map(ref=>ref===ids.graphFunctionRef?graph.name:ref),
    policies:{...oldProgram.policies,'abg.default_start_ref':'start://d1-preserved-mechanical/recovery@5'}};
  // A contribution carries no moduleRef under the current publication contract.
  const contribution={...native.contributions[0],handle:graph.name,declarationOrContractRef:graph.name,
    programMembershipRefs:[program.programRef],readinessPrerequisiteRefs:[program.programRef]};
  const publication=gtl.modulePublication({...native,moduleRef:program.moduleRef,contracts:[],implementationBindings:[],closureContracts:[],
    programs:[program],graphFunctions:[graph],contributions:[contribution]});
  program=publication.programs[0];
  const publications=[native,publication],functions=publications.flatMap(p=>p.graphFunctions).filter(g=>program.callableMembership.includes(g.name));
  const raw=(value,kind)=>{const row=validator.rawAdmitValue(value,kind,'contract://mechanical/raw');assert.equal(row.kind,'raw_admitted_value');return row;};
  function validate(){const p=raw(publication,'module_publication');return validator.validateProgram({declarationBasisDigest:p.subjectDigest,
    programPublication:p,program:raw(program,'gtl_program'),graphFunctions:functions.map(g=>raw(g,'graph_function')),
    contracts:native.contracts.map(c=>raw(c,'contract_declaration')),implementationBindings:native.implementationBindings.map(b=>raw(b,'implementation_binding')),
    closureContracts:native.closureContracts.map(c=>raw(c,'closure_contract')),rules:[],evaluators:[]});}
  function closure(){
    const catalog=product.buildGraphFunctionCatalog(publications);assert.equal(catalog.kind,'graph_function_catalog');
    const assumed={...catalog,boundPublications:publications,readinessBasis:{resolvedLock:{dependencyEdges:[]},
      installedProducts:[{productId:artifact.productId,productContentDigest:artifact.productContentDigest,manifestDigest:artifact.productManifestDigest,
        installId:'install://mechanical/unadmitted',packageName:artifact.packageName,packageVersion:artifact.packageVersion}]}};
    return product.resolveProgramDeclarationClosure(assumed,product.narrowGraphFunctionCatalog(catalog,[graph.name]),program.programRef);
  }
  return {artifact,native,graph,program,publication,publications,validate,closure};
}
