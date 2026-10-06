import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL, fileURLToPath} from 'node:url';
const work=path.dirname(fileURLToPath(import.meta.url));
const baseline=JSON.parse(fs.readFileSync(path.join(work,'baseline.json')));
const tenant=path.join(baseline.donorRoot,'build_tenants/abiogenesis/typescript');
const owners=await import(pathToFileURL(path.join(tenant,'build/code/src/gtl/index.js')));
const {canonicalJson}=await import(pathToFileURL(path.join(tenant,'build/code/src/shared/canonical_json.js')));
const manifest=JSON.parse(fs.readFileSync(path.join(tenant,'product-toolchain-manifest.json')));
const bytesDigest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const donor=path.dirname(baseline.donorRoot);
const archives=fs.readdirSync(path.join(donor,'packs')).filter(x=>x.endsWith('.tgz'));
if(archives.length!==1)throw new Error('accepted group donor does not own one exact package');
const publication=owners.constructHelloWorldModulePublication({
  productId:manifest.productId, packageName:manifest.packageName, packageVersion:manifest.packageVersion,
  artifactDigest:bytesDigest(fs.readFileSync(path.join(donor,'packs',archives[0]))),
  productContentDigest:manifest.productContentDigest,
  productManifestDigest:bytesDigest(fs.readFileSync(path.join(tenant,'product-toolchain-manifest.json'))),
});
const program=publication.programs[0];
if(!program)throw new Error('actual original publication has no Program');
const packet={kind:'conformance_evaluate_packet',schemaVersion:'5.0.0',memberKey:'gtl_program',publication,program};
const leaves=publication.graphFunctions.flatMap(g=>g.template.nodes.flatMap(n=>owners.cLeafTerms(n.term)));
const original=leaves.find(x=>x.requirement.kind==='executable_leaf_requirement');
if(!original)throw new Error('actual original declaration has no executable leaf');
const carrier=owners.cCarrier(original.inputCarrierRef);
const leaf=(role,resultBearing=false)=>owners.C.of({input:carrier,output:carrier,
  programLocusRef:'locus://corpus/'+role,stageRole:role,fibre:original.fibre,armId:'arm://corpus/'+role,
  compositionRef:null,vectorIndex:0,judgmentPredicateRef:original.judgmentPredicateRef,
  resultBearing,requirement:original.requirement});
const transform=leaf('transform'),evaluate=leaf('evaluate'),consequence=leaf('consequence',true);
const interaction=owners.C.of({input:carrier,output:carrier,programLocusRef:'locus://corpus/interaction',
  stageRole:'interaction',fibre:'F_H',armId:'arm://corpus/interaction',compositionRef:null,vectorIndex:0,
  judgmentPredicateRef:original.judgmentPredicateRef,resultBearing:false,requirement:{kind:'interaction_leaf_requirement',
  interactionKind:'corpus_interaction',actorCapabilityRef:'capability://corpus/interaction',
  requestContractRef:carrier.ref,responseContractRef:carrier.ref,continuationContractRef:carrier.ref}});
const constructors=[['c_of',consequence],['c_identity',owners.C.id(carrier)],
 ['c_compose',owners.C.compose(transform,consequence)],
 ['c_edge',owners.C.edge({transform,evaluate,consequence})],
 ['c_workflow',owners.workflow.C(owners.cGraphFunctionRef({graphFunctionRef:publication.graphFunctions[0].name,input:carrier,output:carrier}))],
 ['c_batch',owners.C.batch([consequence,consequence],'batch://corpus/tasks')],
 ['c_retry',owners.C.retry(consequence,2)]];
const corpus={kind:'gtl_language_conformance_corpus',schemaVersion:'5.0.0',corpusVersion:'1',
  diagnosticVocabularyContractRef:'abg.vocabulary.gtl-program-diagnostic-id',
  premises:{scope:'pure Source component; original Program and declarations supplied, no installed/runtime authority',
    originalOwner:'repo://abiogenesis/build_tenants/abiogenesis/typescript/code/src/gtl/hello_world.ts',
    originalOwnerDigest:bytesDigest(fs.readFileSync(path.join(tenant,'code/src/gtl/hello_world.ts'))),
    declarationBasis:'publication-local declarations at the actual conformance owner; no resolved external dependencies',
    constructorExamples:'native constructor-local witnesses only; external membership/binding/result obligations are not claimed'},
  programs:[{caseId:'original-hello-world-declaration',packet,expectedDisposition:'passed',expectedDiagnosticIds:[],
    mutations:[
      {caseId:'foreign-module',target:'program_and_published_program',path:['moduleRef'],operation:'replace',value:'module://corpus/foreign',expectedDiagnosticIds:['identity_mismatch']},
      {caseId:'duplicate-membership',target:'program_and_published_program',path:['callableMembership'],operation:'append_first',expectedDiagnosticIds:['duplicate_identity']},
      {caseId:'missing-callable',target:'program_and_published_program',path:['callableMembership'],operation:'append',value:'graph-function://corpus/absent',expectedDiagnosticIds:['missing_membership']},
      {caseId:'missing-binding',target:'publication',path:['implementationBindings'],operation:'replace',value:[],expectedDiagnosticIds:['missing_binding']},
      {caseId:'missing-contracts',target:'publication',path:['contracts'],operation:'replace',value:[],expectedDiagnosticIds:['missing_contract']},
    ]}],
  constructors:constructors.map(([kind,syntax])=>({kind,syntax,expectedDisposition:'admitted'})),
  interactionSyntax:interaction,
  localNegatives:[
    {caseId:'missing-retry-child',constructorKind:'c_retry',operation:'remove',path:['term'],expectedCode:'invalid_kind',expectedPath:'$/term'},
    {caseId:'unknown-recursive-key',constructorKind:'c_retry',operation:'replace',path:['term','unknown'],value:true,expectedCode:'invalid_kind',expectedPath:'$/term/unknown'},
    {caseId:'unsafe-retry-budget',constructorKind:'c_retry',operation:'replace',path:['budget'],value:0,expectedCode:'invalid_kind',expectedPath:'$/budget'},
    {caseId:'wrong-edge-role',constructorKind:'c_edge',operation:'replace',path:['evaluate','stageRole'],value:'transform',expectedCode:'invalid_kind',expectedPath:'$/evaluate/stageRole'},
    {caseId:'broken-identity-carrier',constructorKind:'c_identity',operation:'replace',path:['outputCarrierRef'],value:'contract://corpus/foreign',expectedCode:'invalid_kind',expectedPath:'$/outputCarrierRef'},
  ]};
const output=path.join(work,'authored-corpus.json');
if(fs.existsSync(output))throw new Error('corpus author output must be new');
fs.writeFileSync(output,canonicalJson(JSON.parse(canonicalJson(corpus)))+'\n');
console.log(JSON.stringify({kind:'corpus_preparation',originalOwner:corpus.premises.originalOwner,
  originalOwnerDigest:corpus.premises.originalOwnerDigest,programRef:program.programRef,
  programCases:corpus.programs.length,wholeLawMutations:corpus.programs[0].mutations.length,
  constructors:corpus.constructors.map(x=>x.kind),localNegatives:corpus.localNegatives.length,
  corpusBytes:fs.statSync(output).size,corpusDigest:bytesDigest(fs.readFileSync(output)),checkerCalls:0,RuntimeCalls:0}));
