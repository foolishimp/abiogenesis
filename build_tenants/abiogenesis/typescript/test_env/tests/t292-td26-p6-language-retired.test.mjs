import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import * as gtl from '../support/language-structural-gtl.mjs';
import * as m02 from '../../build/code/src/gtl/m02.js';
import * as validator from '../../build/code/src/validator/index.js';
import * as product from '../../build/code/src/product/index.js';
import {evaluateGtlProgramConformance} from '../../build/code/src/validator/conformance_operation.js';

const original=gtl.constructStructuralModulePublication({productId:'product://td26p6/structural',packageName:'@abiogenesis/td26p6-structural',packageVersion:'5.0.0',artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)});
const selected=original.programs.findIndex(program=>program.starts.length>0);
assert.ok(selected>=0);
// Both formerly optional Program members are absent from the language. Presence
// itself refuses, including complete old structural carriers, null and [].
function retiredValues(program){
 const row={kind:'action_catalog_row',actionRef:'action://td26p6',actionKind:'invoke_graph_function',programRef:program.programRef,
  graphFunctionRef:program.starts[0].graphFunctionRef,targetProgramLocusRef:program.starts[0].graphFunctionRef,
  targetObligationRefs:['obligation://td26p6'],inputAssetRefs:['asset://td26p6/input'],outputAssetRefs:['asset://td26p6/output'],
  expectedDeltaRef:'delta://td26p6',progressConditionRef:'condition://td26p6/progress',stopConditionRef:'condition://td26p6/stop'};
 const body={kind:'action_catalog',schemaVersion:'5.0.0',rows:[row]},catalogDigest=product.sha256Canonical(body);
 const composition={kind:'construction_composition',schemaVersion:'5.0.0',compositionRef:'composition://td26p6',graphFunctionRef:program.starts[0].graphFunctionRef,
  authorities:['synthesizeModel','evalGap','evaluateNext','evaluateAction'].map((semanticAuthority,i)=>({kind:'construction_authority_binding',semanticAuthority,authorityRef:'authority://td26p6/'+i,initialProgramLocusRef:'locus://td26p6/'+i,refreshProgramLocusRef:null})),
  interactionProgramLocusRef:'locus://td26p6/interaction',closurePolicy:{kind:'construction_policy',policyRef:'policy://td26p6',requireCompleteEvidence:true,requirePostEvidenceRefresh:true}};
 return {actionCatalog:{...body,catalogRef:'action-catalog://product/'+catalogDigest.slice(7),catalogDigest},constructionComposition:{...composition,compositionDigest:product.sha256Canonical(composition)}};
}

test('retired Program keys refuse at raw, module, publication, Catalog and conformance admission',t=>{
 const positive=m02.admitModule(original);assert.equal(positive.kind,'raw_admitted_value');
 const positiveContributions=original.contributions.map(c=>validator.rawAdmitValue(c,'catalog_contribution','contract://td26p6/contribution'));
 assert.equal(validator.validatePublication(positive,positiveContributions).kind,'publication_validation');
 let cases=0;
 for(const [key,oldValue] of Object.entries(retiredValues(original.programs[selected])))for(const value of [oldValue,null,[]]){
  const publication=structuredClone(original);publication.programs[selected][key]=value;const program=publication.programs[selected];
  for(const [subject,kind] of [[program,'gtl_program'],[publication,'module_publication']]){
   const refused=validator.rawAdmitValue(subject,kind,'contract://td26p6/'+kind);assert.equal(refused.kind,'raw_admission_refusal');assert.equal(refused.code,'invalid_kind');assert.match(refused.message,new RegExp(key));
  }
  assert.equal(m02.admitModule(publication).code,'invalid_kind');assert.throws(()=>m02.serializeModule(publication),TypeError);
  // Publication validation consumes a privately minted raw admission; a refused
  // module cannot manufacture one. Catalog admission exposes that exact owner.
  const catalog=product.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion:'5.0.0',memberKey:'admit',readinessBasis:{publications:[publication]}});
  assert.equal(catalog.kind,'catalog_validation_refusal');assert.equal(catalog.validation.code,'invalid_kind');assert.match(catalog.validation.message,new RegExp(key));
  const conformance=evaluateGtlProgramConformance({kind:'conformance_evaluate_packet',schemaVersion:'5.0.0',memberKey:'gtl_program',program,publication});
  assert.equal(conformance.kind,'gtl_program_conformance_refusal');assert.equal(conformance.code,'raw_admission_refused');
  cases++;
 }
 t.diagnostic(JSON.stringify({retiredKeyCases:cases,publicationOwner:'raw admission before publication validation'}));
});

test('all eight shipped publications omit retired Program members without withdrawing corpus IDs',()=>{
 const names=['constructDefaultGovernanceLibraryModulePublication','constructWorksiteConstructionModulePublication','constructWorksiteCommandExecutionModulePublication','constructNativeWorkspaceWorkModulePublication','constructRequirementHandoffModulePublication','constructSemanticStageModulePublication','constructSemanticRevisionModulePublication','constructSelfConformanceModulePublication'];
 const basis={productId:product.ABI5_PRODUCT_ID,packageName:product.ABI5_PACKAGE_NAME,packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
 const publications=names.map(name=>gtl[name](basis));
 for(const publication of publications)for(const program of publication.programs)for(const key of ['actionCatalog','constructionComposition'])assert.equal(Object.hasOwn(program,key),false,publication.moduleRef+' '+key);
 // T-293 B36: the fixed 15-family 5.0 vocabulary is 33 identities; the nine
 // Consensus identities are retired to the planned 5.1 Product (A5-F08). The
 // retired Program members withdraw no GTL corpus identity: the corpus row, its
 // eleven case IDs and their diagnostic-vocabulary bindings all remain.
 const mandatory=product.MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS;
 assert.equal(mandatory.length,33);
 assert.deepEqual(mandatory.filter(id=>/consensus|review-(?:findings|rulings|ruling-kind)/u.test(id)),[],'Consensus identities are retired from the current vocabulary');
 for(const id of ['abg.asset.gtl.language-conformance-corpus','abg.vocabulary.gtl-program-diagnostic-id','abg.schema.gtl-graph-function','abg.schema.gtl-module','abg.schema.gtl-c-program','abg.schema.gtl-program-conformance-input'])assert.ok(mandatory.includes(id),id);
 const corpus=JSON.parse(readFileSync(new URL('../../contracts/conformance/gtl-language-conformance-corpus.json',import.meta.url),'utf8'));
 const vocabulary=JSON.parse(readFileSync(new URL('../../contracts/vocabularies/gtl-program-diagnostic-id.json',import.meta.url),'utf8'));
 assert.equal(corpus.diagnosticVocabularyContractRef,'abg.vocabulary.gtl-program-diagnostic-id');
 assert.equal('abg.vocabulary.'+vocabulary.vocabularyId,corpus.diagnosticVocabularyContractRef);
 const mutations=corpus.programs.flatMap(program=>program.mutations);
 const caseIds=[...corpus.localNegatives,...corpus.programs,...mutations].map(entry=>entry.caseId).sort();
 assert.deepEqual(caseIds,['broken-identity-carrier','duplicate-membership','foreign-module','missing-binding','missing-callable','missing-contracts',
  'missing-retry-child','original-source-declarations-program','unknown-recursive-key','unsafe-retry-budget','wrong-edge-role']);
 assert.deepEqual(mutations.map(mutation=>[mutation.caseId,mutation.expectedDiagnosticIds]),[['foreign-module',['identity_mismatch']],
  ['duplicate-membership',['duplicate_identity']],['missing-callable',['missing_membership']],['missing-binding',['missing_binding']],['missing-contracts',['missing_contract']]]);
 for(const program of corpus.programs)assert.deepEqual(program.expectedDiagnosticIds,[],program.caseId);
 for(const id of mutations.flatMap(mutation=>mutation.expectedDiagnosticIds))assert.ok(vocabulary.values.includes(id),id);
});
