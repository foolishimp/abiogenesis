// External, job-independent declarations. All admission and execution remain ABI.
import assert from 'node:assert/strict';
export const ids=Object.freeze({packageName:'@abiogenesis-fixtures/registered-selection',packageVersion:'5.0.0',
 productId:'product://default-library-witness/consumer@5',descriptorRef:'descriptor://default-library-witness/consumer@5',
 contributionManifestRef:'contribution-manifest://default-library-witness/consumer@5',catalogRef:'catalog://s06-witness/contracts@5',
 provenanceRef:'provenance://s06-witness/imported-source@5',moduleRef:'module://s06-witness/native-lifecycle@5',
 lifecycleDeclarationRef:'lifecycle://s06-witness/source-to-application@5',programRef:'program://s06-witness/d1@5',
 graphFunctionRef:'graph-function://s06-witness/d1@5',graphRef:'graph://s06-witness/d1@5',
 startRef:'start://s06-witness/d1@5',closureContractRef:'contract://s06-witness/d1-closure@5'});
export function declare({gtl,product,corePublications,nativeDeclarations,D,environment,recursionBound}) {
 const semantic=corePublications.filter(p=>p.moduleRef===gtl.SEMANTIC_STAGE_IDS.moduleRef);
 const library=corePublications.filter(p=>p.graphFunctions.some(g=>g.name===gtl.defaultGovernanceGraphFunctions()[0].name));
 assert.equal(semantic.length,1);assert.equal(library.length,1);
 // Optional obsolete runEnvironment is deliberately absent. Native semantic
 // task owners bind current stage/role, source, candidate and evaluation data.
 const d1=nativeDeclarations.constructFreshNativeLifecyclePublication({gtl,product,ids,semanticPublication:semantic[0]});
 const d2Data=D.libraryConsumerDeclaration(gtl,library[0],environment.declaration,{purposes:['design','construction','testing','review','uat'],
  bound:recursionBound,prerequisites:{construction:['review://s06-witness/d2-impact@5']}});
 const zero='sha256:'+'0'.repeat(64);
 const d2=gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...d2Data,
  artifactDigest:zero,productContentDigest:zero,productManifestDigest:zero,
  contributions:d2Data.contributions.map(c=>({...c,provenanceRefs:[zero,zero]}))});
 assert.equal(d1.owningProductId,d2.owningProductId);
 return {publications:[d1,d2],programRefs:{d1:ids.programRef,d2:D.witnessRef('program','witness')},lifecycle:d1.semanticJobLifecycle};
}
