// Pure packed-component proof. Original declarations and native witnesses are
// supplied here; no Product install, Runtime resource, helper, provider or Run.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as m01 from '@abiogenesis/typescript-tenant/gtl/m01';
import * as m02 from '@abiogenesis/typescript-tenant/gtl/m02';
import * as m03 from '@abiogenesis/typescript-tenant/abg/m03';
import * as gtl from '@abiogenesis/typescript-tenant/gtl';
const root=process.env.ABI5_GTL_CORE_PACKAGE_ROOT;
assert(root,'proof requires the explicit extracted package');
assert.equal(fileURLToPath(import.meta.resolve('@abiogenesis/typescript-tenant/gtl/m01')),path.join(root,'build/code/src/gtl/m01.js'));
const require=createRequire(import.meta.url),ts=require(path.join(root,'build/toolchain/typescript.cjs'));
const {canonicalJson}=await import(pathToFileURL(path.join(root,'build/code/src/shared/canonical_json.js')));
const {admitIJsonText}=await import(pathToFileURL(path.join(root,'build/code/src/shared/i_json.js')));
const {sha256Canonical}=await import(pathToFileURL(path.join(root,'build/code/src/shared/digests.js')));
const {resolveNativeDeclarationClosures}=await import(pathToFileURL(path.join(root,'build/code/src/product/declaration_exports.js')));
const Ajv=require(path.join(root,'node_modules/ajv/dist/2020.js')).default;
const hash=b=>'sha256:'+createHash('sha256').update(b).digest('hex'),clone=x=>structuredClone(x);
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
const manifest=json('product-toolchain-manifest.json'),catalog=manifest.publicContractCatalog;
const corpus=json('contracts/conformance/gtl-language-conformance-corpus.json');
const schema=json(corpus.schema.path),ajv=new Ajv({strict:true,allowUnionTypes:true});
ajv.addSchema(schema);
const schemaCheck=name=>ajv.getSchema(schema.$id+'#/$defs/'+name);
const admitted=(result,label)=>{assert.equal(result.kind,'raw_admitted_value',label+': '+JSON.stringify(result));return result;};

// Resolve the actual packaged schema; no independently authored equivalent.
function resolveSchemaNode(node){
 while(node.$ref){assert(node.$ref.startsWith('#/'),'local published schema reference');
  node=node.$ref.slice(2).split('/').reduce((value,key)=>value[key.replaceAll('~1','/').replaceAll('~0','~')],schema);
 }
 return node;
}
function publishedModuleField(...keys){
 let node=schema.$defs.ModulePublication;
 for(const key of keys){node=resolveSchemaNode(node);assert(Object.hasOwn(node,key),key);node=node[key];}
 return ajv.compile({...resolveSchemaNode(node),$schema:schema.$schema,$defs:schema.$defs});
}

test('packaged environment scalar projections preserve the original predicate languages',async t=>{
 const {STDO_RUN_ENVIRONMENT_SCHEMA:stdo,RUN_ENVIRONMENT_SCHEMA:run}=await import(pathToFileURL(path.join(root,'build/code/src/gtl/stdo_run_environment.js')));
 const v=createRequire(path.join(root,'package.json'))('valibot');
 const pathSchemas=[
  [stdo.entries.axiom.entries.executablePath,publishedModuleField('properties','stdoRunEnvironments','items','properties','axiom','properties','executablePath')],
  [run.entries.dependencies.item.entries.members.item.entries.path,publishedModuleField('properties','runEnvironments','items','properties','dependencies','items','properties','members','items','properties','path')],
 ];
 // The frozen preimage's split predicate is the independent conservation oracle.
 const originalPath=value=>value.length>0&&!value.startsWith('/')&&!value.split('/').some(segment=>segment==='.'||segment==='..'||segment==='');
 const segments=['a','.','..','',' ','\\','é','😀','\n','\r','\u2028','\u2029','.\n','..\r'];
 const cases=new Set(['','/','/a','a/','a//b','./a','a/../b','a/./b','a/..\n','a/.\r','a\n/é\u2028','a\\b','C:\\a','a\0b',...segments]);
 for(const left of segments)for(const right of segments)cases.add(left+'/'+right);
 for(const value of cases)for(const [native,published]of pathSchemas){
  const expected=originalPath(value),label=JSON.stringify(value);
  assert.equal(v.safeParse(native,value).success,expected,'native path '+label);
  assert.equal(published(value),expected,'published path '+label);
 }
 const scalars=[
  [stdo.entries.declarationRef,publishedModuleField('properties','stdoRunEnvironments','items','properties','declarationRef'),value=>value.length>0,['',' ','\n','ref://valid']],
  [stdo.entries.source.entries.manifestDigest,publishedModuleField('properties','stdoRunEnvironments','items','properties','source','properties','manifestDigest'),value=>/^sha256:[a-f0-9]{64}$/u.test(value),['sha256:'+'a'.repeat(64),'sha256:'+'A'.repeat(64),'sha256:'+'a'.repeat(63),'sha256:'+'a'.repeat(64)+'\n','not-a-digest']],
  [stdo.entries.axiom.entries.tagObject,publishedModuleField('properties','stdoRunEnvironments','items','properties','axiom','properties','tagObject'),value=>/^[a-f0-9]{40}$/u.test(value),['a'.repeat(40),'A'.repeat(40),'a'.repeat(39),'a'.repeat(40)+'\n','a'.repeat(40)+'\u2028']],
 ];
 for(const [native,published,original,values]of scalars)for(const value of values){
  assert.equal(v.safeParse(native,value).success,original(value),'native scalar '+JSON.stringify(value));
  assert.equal(published(value),original(value),'published scalar '+JSON.stringify(value));
 }
 t.diagnostic(JSON.stringify({pathCases:cases.size,pathOwners:2,originalSplitOracle:true,publishedSchema:corpus.schema.path,nonemptyReferencePreserved:true}));
});

test('complete optional declarations roundtrip while native relational guards remain distinct',t=>{
 const base=clone(corpus.programs[0].packet.publication),zero='sha256:'+'0'.repeat(64);
 const member={memberRef:'member://supplied',path:'source/input.md',byteCount:4,digest:zero};
 const context={contextRef:'context://supplied',sourceLocator:'source://supplied',inventoryDigest:sha256Canonical([member]),members:[member]};
 const binding={contextRef:context.contextRef,memberRef:member.memberRef,memberDigest:member.digest,startByte:0,endByte:4,spanDigest:zero};
 // These are supplied local declarations, not admitted whole-Program/Run proof.
 const stage={declarationRef:'stage://supplied',graphFunctionRef:'graph-function://supplied',authorLocusRef:'locus://author',assessorLocusRef:'locus://assessor',
  predecessorStageRefs:[],assetSurface:{kind:'supplied',requiredContexts:[gtl.SEMANTIC_STAGE_IDS.jobSourceContextRoleRef],standardsRefs:[],outputContractRefs:[],constructorRef:'constructor://supplied',rendererRef:'renderer://supplied',proofObligationRefs:[],authoritySlots:[]},
  purpose:'Supplied local conservation witness',requiredContent:[],rubric:[{criterionRef:'criterion://supplied',instruction:'Preserve the original contract'}],bodyCapabilities:['worksite_design'],
  assembly:{ruleRef:'rule://supplied',graphFunctionRef:'graph-function://supplied',sectionOrder:['role','source','obligations','predecessors','worksite','evidence','task','response'],proportionalityPolicy:'declared_semantic_assessment',maxPromptBytes:1024,contentPolicy:'role_scoped_worksite',worksiteContentByRole:{author:'current_inventory',assessor:'current_inventory'}}};
 const lifecycle=gtl.constructSemanticLifecycleDeclaration({declarationRef:'lifecycle://supplied',sourceDeclarationRef:'source-declaration://supplied',taskDataDigest:zero,evaluationDataDigest:zero,proofPolicies:[],proofShapes:[],stages:[stage]});
 const job=gtl.constructSemanticJobLifecycleDeclaration({kind:'semantic_job_lifecycle_declaration',schemaVersion:'5.0.0',declarationRef:'job://supplied',intakeGraphFunctionRef:'graph-function://intake',sourceRoleRef:'role://source',
  bounds:{maxSourceMembers:1,maxSourceBytes:4,maxContextFiles:1,maxContextBytes:4,maxTargets:1,maxCommands:1},
  proofTemplates:[{templateRef:'template://supplied',realizationContractRef:'contract://realization',proofContractRef:'contract://proof',requiredEvidenceRoles:['realization','verifier_artifact','verifier_execution','semantic_assessment'],sharedBasis:[],requiredContent:[]}],stages:[stage]});
 const handoff={declarationRef:'handoff://supplied',graphFunctionRef:'graph-function://handoff',sourceRoleRef:'role://source',context,
  terms:[{requirementRef:'requirement://supplied',sourceBindings:[binding]}],fulfillmentBindings:[{obligationRef:'obligation://supplied',requirementRef:'requirement://supplied',realizationContractRef:null,proofContractRef:null,proofPolicyRef:null,proofShapeRef:null}]};
 const historicalContext={...context,sourceLocator:'stdo://releases/v2.5.0-rc.7/'};
 const inventory=paths=>paths.map(path=>({path,type:'file',digest:zero,target:null})).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
 const companion=paths=>{const members=inventory(paths);return {productRef:'product://supplied',releaseRef:'release://supplied',tagObject:'a'.repeat(40),recordUri:'record://supplied',recordDigest:zero,inventoryDigest:gtl.stdoInventoryDigest(members),members};};
 const artifact=path=>({path,uri:'artifact://supplied/'+path,byteDigest:zero,canonicalDigest:zero});
 const historical={kind:'stdo_run_environment_declaration',schemaVersion:'5.0.0',declarationRef:' ',source:{releaseUri:historicalContext.sourceLocator,manifestDigest:zero},
  representation:{...companion(['map.json','program.json']),program:artifact('program.json'),map:artifact('map.json')},
  axiom:{...companion(['contract.json','executable.py']),executablePath:'executable.py',outputContractPath:'contract.json',outputContractVersion:'axiom-indexer.frame-projection@1',pythonExecutableDigest:zero},
  contexts:[historicalContext],accesses:[{accessRef:'access://supplied',operation:'project',mode:'materialized',frameIndexRefs:['frame://supplied'],maxOutputBytes:1,timeoutMs:1}],
  roles:[{graphFunctionRef:'graph-function://supplied',programLocusRef:'locus://supplied',role:'author',frameRefs:['frame://supplied'],policy:{policyRef:'policy://supplied',text:' ',digest:hash(Buffer.from(' '))},accessRefs:['access://supplied'],sourceBindings:[binding]}]};
 assert(gtl.isStdoRunEnvironmentDeclaration(historical),'historical component declaration, not current governing basis');
 const run=gtl.defaultLibraryRunEnvironment();
 const fixtures=[['semanticLifecycle',lifecycle],['semanticJobLifecycle',job],['requirementHandoffs',[handoff]],['stdoRunEnvironments',[historical]],['runEnvironments',[run]]];
 const roundtrip=(publication,label)=>{const first=admitted(m02.admitModule(publication),label),text=m02.serializeModule(first.value),second=admitted(m02.admitModule(admitIJsonText(text)),label+' roundtrip');
  assert.deepEqual(second.value,first.value);assert.equal(second.subjectDigest,first.subjectDigest);assert.equal(schemaCheck('ModulePublication')(second.value),true,label);return first;};
 let guardNegatives=0;
 for(const [field,value]of fixtures){const publication={...clone(base),[field]:clone(value)};roundtrip(publication,field);
  const unknown=clone(publication);const declaration=Array.isArray(unknown[field])?unknown[field][0]:unknown[field];declaration.extra=true;
  assert.equal(schemaCheck('ModulePublication')(unknown),false,field+' unknown field');assert.equal(m02.admitModule(unknown).code,'invalid_kind',field+' unknown field');
 }
 for(const field of ['semanticLifecycle','semanticJobLifecycle']){
  const value=field==='semanticLifecycle'?lifecycle:job,publication={...clone(base),[field]:clone(value)};
  for(const mutate of [s=>s.assembly.graphFunctionRef='graph-function://crossed',s=>s.rubric.push(clone(s.rubric[0])),s=>s.predecessorStageRefs=['stage://predecessor','stage://predecessor'],s=>s.assembly.worksiteContentByRole.author='not_required']){
   const changed=clone(publication);mutate(changed[field].stages[0]);
   assert.equal(schemaCheck('ModulePublication')(changed),true,'structural validity is not local relation admission');
   const refused=m02.admitModule(changed);assert.equal(refused.code,'invalid_kind');assert(refused.message.includes('$/'+field),refused.message);guardNegatives++;roundtrip(publication,field+' restored');
  }
 }
 for(const [field,value,mutate]of [
  ['requirementHandoffs',[handoff],d=>d[0].terms[0].sourceBindings[0].endByte=5],
  ['stdoRunEnvironments',[historical],d=>d[0].roles[0].policy.digest=zero],
  ['runEnvironments',[run],d=>d[0].roles[0].sourceBindings[0].endByte=Number.MAX_SAFE_INTEGER],
 ]){const publication={...clone(base),[field]:clone(value)},changed=clone(publication);mutate(changed[field]);
  assert.equal(schemaCheck('ModulePublication')(changed),true,field+' local relation remains separate');
  const refused=m02.admitModule(changed);assert.equal(refused.code,'invalid_kind');assert(refused.message.includes('$/'+field),refused.message);guardNegatives++;roundtrip(publication,field+' restored');
 }
 t.diagnostic(JSON.stringify({optionalOwners:fixtures.map(([field])=>field),guardNegatives,originalRestorations:guardNegatives,suppliedLocalDeclarations:true,wholeProgramClaims:0,RuntimeCalls:0}));
});

test('exact extracted package binds all current schema/API/native declarations and preserves prior addresses',async t=>{
 const baseline=JSON.parse(fs.readFileSync(process.env.ABI5_GTL_CORE_BASELINE));
 const packageJson=json('package.json');assert.deepEqual(packageJson.exports,baseline.package.exports);
 assert.equal(catalog.rows.length,baseline.catalogIds.length+6);
 for(const id of baseline.catalogIds)assert.equal(catalog.rows.filter(row=>row.contractId===id).length,1,id);
 assert(!catalog.rows.some(row=>row.contractId==='abg.vocabulary.gtl-program-repair-edit-class'),'unsettled repair meaning is not published as complete');
 const selected=[
  ['abg.schema.gtl-graph-function','GraphFunction','./gtl/m01','GTL_GRAPH_FUNCTION_SERIALIZATION_API',m01,['admitGraphFunction','serializeGraphFunction']],
  ['abg.schema.gtl-module','ModulePublication','./gtl/m02','GTL_MODULE_SERIALIZATION_API',m02,['admitModule','serializeModule']],
  ['abg.schema.gtl-c-program','CProgramSyntax','./gtl/m01','GTL_C_PROGRAM_SERIALIZATION_API',m01,['admitCProgramSyntax','serializeCProgramCanonical']],
  ['abg.schema.gtl-program-conformance-input','GtlProgramConformanceInput','./abg/m03','GTL_PROGRAM_CONFORMANCE_INPUT_API',m03,['admitGtlProgramConformanceInput','typecheckGtlProgram']],
 ];
 const sources=[],metadata=[];
 const visit=directory=>{for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const absolute=path.join(directory,entry.name),relative=path.relative(root,absolute).split(path.sep).join('/');
  assert(!entry.isSymbolicLink(),'extracted package has no hidden symlink dependency');
  if(entry.isDirectory())visit(absolute);
  else if(entry.isFile()&&(relative.endsWith('.d.ts')||entry.name==='package.json')){
   const bytes=fs.readFileSync(absolute),row={path:relative,bytes};
   if(relative.endsWith('.d.ts'))sources.push(row);else metadata.push(row);
  }
 }};visit(root);
 const closures=await resolveNativeDeclarationClosures({packageName:packageJson.name,packageType:'module',
  packageExports:packageJson.exports,declarationSources:sources,packageMetadataSources:metadata,
  sourceProductContentDigest:manifest.productContentDigest});assert(closures);
 for(const [id,name,address,anchor,owner,functions]of selected){
  const row=catalog.rows.find(r=>r.contractId===id);assert(row,id);
  assert.equal(row.contractKind,'serialized_native_contract');
  assert.equal(row.assetLocator.path,corpus.schema.path);assert.equal(row.assetLocator.definitionRef,'#/$defs/'+name);
  assert.equal(hash(fs.readFileSync(path.join(root,row.assetLocator.path))),row.contractDigest);
  assert.equal(row.assetLocator.contentDigest,row.contractDigest);assert.equal(row.nativeTypedLocator.packageExportPath,address);
  assert.equal(row.nativeTypedLocator.namedSymbol,anchor);
  const closure=closures.find(c=>c.packageExportPath===address);assert(closure);
  assert.deepEqual(row.nativeTypedLocator.declarationInventory,closure.declarationInventory);
  assert(closure.exportedSymbols.includes(anchor));for(const fn of functions){assert(closure.exportedSymbols.includes(fn),fn);assert.equal(typeof owner[fn],'function');assert.equal(owner[anchor][fn],owner[fn]);}
  assert(Object.isFrozen(owner[anchor]));assert.equal(owner[anchor].schemaDefinition,name);assert(schemaCheck(name));
 }
 const inputClosure=closures.find(c=>c.packageExportPath==='./abg/m03');assert(inputClosure.exportedSymbols.includes('GtlProgramConformanceInput'));
 const vocabularyRow=catalog.rows.find(r=>r.contractId==='abg.vocabulary.gtl-program-diagnostic-id');assert(vocabularyRow);
 assert.equal(hash(fs.readFileSync(path.join(root,vocabularyRow.assetLocator.path))),vocabularyRow.contractDigest);
 assert.deepEqual(json(vocabularyRow.assetLocator.path).values,m03.GTL_PROGRAM_DIAGNOSTIC_ID_VALUES);
 assert.deepEqual(m03.GTL_PROGRAM_DIAGNOSTIC_REGISTER.map(x=>x.id),m03.GTL_PROGRAM_DIAGNOSTIC_ID_VALUES);
 assert.equal(m03.GTL_PROGRAM_DIAGNOSTIC_ID_VALUES.length,19);assert.throws(()=>m03.constructGtlProgramDiagnosticId('invented_diagnostic'));
 const corpusRow=catalog.rows.find(r=>r.contractId==='abg.asset.gtl.language-conformance-corpus');assert(corpusRow);
 assert.equal(corpusRow.assetLocator.path,'contracts/conformance/gtl-language-conformance-corpus.json');
 assert.equal(hash(fs.readFileSync(path.join(root,corpusRow.assetLocator.path))),corpusRow.contractDigest);
 assert.equal(corpus.diagnosticVocabularyContractRef,vocabularyRow.contractId);
 assert.equal(corpus.schema.contentDigest,hash(fs.readFileSync(path.join(root,corpus.schema.path))));
 assert.equal(schemaCheck('GtlLanguageConformanceCorpus')(corpus),true,JSON.stringify(schemaCheck('GtlLanguageConformanceCorpus').errors));
 t.diagnostic(JSON.stringify({catalogRows:catalog.rows.length,oldIdentities:baseline.catalogIds.length,
  packageExports:Object.keys(packageJson.exports).length,nativeDeclarationSources:sources.length,
  pairedRows:selected.length,corpusDigest:corpusRow.contractDigest,diagnosticValues:19}));
});

test('packed native types expose original recursively typed carriers and preserve constructor witnesses',t=>{
 const file=path.join(path.dirname(fileURLToPath(import.meta.url)),'strict-native-consumer.mts');
 const source=`import {C,cCarrier,admitGraphFunction,serializeGraphFunction,admitCProgramSyntax,serializeCProgramCanonical,type CProgramNode,type CProgramTerm,type GraphFunction} from '@abiogenesis/typescript-tenant/gtl/m01';
import {admitModule,serializeModule,type ModulePublication} from '@abiogenesis/typescript-tenant/gtl/m02';
import {admitGtlProgramConformanceInput,typecheckGtlProgram,type GtlProgramConformanceInput,type GtlProgramDiagnosticId} from '@abiogenesis/typescript-tenant/abg/m03';
declare const graph:GraphFunction, publication:ModulePublication, input:GtlProgramConformanceInput;
const graphText:string=serializeGraphFunction(graph),moduleText:string=serializeModule(publication);
const g=admitGraphFunction(JSON.parse(graphText));if(g.kind==='raw_admitted_value'){const n:CProgramNode=g.value.template.nodes[0]!.term;serializeCProgramCanonical(n);}
const m=admitModule(JSON.parse(moduleText));if(m.kind==='raw_admitted_value'){const p:ModulePublication=m.value;serializeModule(p);}
const p=admitGtlProgramConformanceInput(input);if(p.kind==='raw_admitted_value')typecheckGtlProgram(p);
const native=C.id(cCarrier<{readonly value:string}>('carrier://strict'));const witnessed:CProgramTerm<{readonly value:string},{readonly value:string},never,'zero'>=native;
const syntax=admitCProgramSyntax(JSON.parse(serializeCProgramCanonical(native)));if(syntax.kind==='raw_admitted_value'){
// @ts-expect-error erased syntax does not manufacture a native witness
const falseWitness:CProgramTerm<string,string>=syntax.value;
}
// @ts-expect-error original C syntax has a closed discriminant
const bad:CProgramNode={kind:'new_constructor',inputCarrierRef:'a',outputCarrierRef:'b'};
// @ts-expect-error supported diagnostic identities are closed
const diagnostic:GtlProgramDiagnosticId='unknown';
// @ts-expect-error native input/output witnesses cannot cross carrier types
const crossed:CProgramTerm<number,number>=native;
`;
 assert(!fs.existsSync(file));fs.writeFileSync(file,source);
 const options={module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,
  target:ts.ScriptTarget.ES2022,strict:true,exactOptionalPropertyTypes:true,noEmit:true,skipLibCheck:false};
 const program=ts.createProgram([file],options);const diagnostics=ts.getPreEmitDiagnostics(program);
 assert.equal(diagnostics.length,0,ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCanonicalFileName:x=>x,getCurrentDirectory:()=>path.dirname(file),getNewLine:()=> '\n'}));
 t.diagnostic(JSON.stringify({nativeConsumer:file,strict:true,diagnostics:0,erasedWitnessNegative:true,crossedWitnessNegative:true}));
});

test('recursive original seven-term syntax roundtrips without acquiring native metadata',()=>{
 assert.deepEqual(corpus.constructors.map(x=>x.kind),['c_of','c_identity','c_compose','c_edge','c_workflow','c_batch','c_retry']);
 for(const row of [...corpus.constructors,{kind:'interaction',syntax:corpus.interactionSyntax}]){
  const first=admitted(m01.admitCProgramSyntax(row.syntax),row.kind);
  const text=m01.serializeCProgramCanonical(first.value),second=admitted(m01.admitCProgramSyntax(admitIJsonText(text)),row.kind);
  assert.equal(first.subjectDigest,second.subjectDigest);assert.deepEqual(first.value,second.value);
  assert.equal(schemaCheck('CProgramSyntax')(second.value),true);assert(!m01.isNativeCProgramTerm(second.value));
  assert.equal(text,canonicalJson(row.syntax));assert(Object.isFrozen(second.value));
 }
 const native=m01.C.retry(m01.C.id(m01.cCarrier('carrier://native-roundtrip')),3);
 assert(m01.isNativeCProgramTerm(native));assert.equal(m01.admitCProgramSyntax(native).code,'non_canonical_value');
 const erased=admitted(m01.admitCProgramSyntax(admitIJsonText(m01.serializeCProgramCanonical(native))),'native-erasure');
 assert(!m01.isNativeCProgramTerm(erased.value));assert.equal(erased.value.term.kind,'c_identity');assert.equal(erased.value.budget,3);
 const foreign={...erased.value};Object.defineProperty(foreign,Symbol('foreign'),{value:{}});
 assert.throws(()=>m01.serializeCProgramCanonical(foreign),/symbol object members/);
});

test('local admission rejects malformed erased structure and hostile I-JSON without stripping data',()=>{
 const valid=corpus.programs[0].packet.publication.graphFunctions[0];
 const bad=clone(valid);bad.template.nodes[0].term.kind='new_term';
 assert.equal(m01.admitGraphFunction(bad).code,'invalid_kind');
 const missing=clone(valid);delete missing.effects;const m=m01.admitGraphFunction(missing);assert.equal(m.code,'invalid_kind');assert.match(m.message,/\$\/effects/);
 const nested=clone(valid);nested.template.nodes[0].unknown=true;const n=m01.admitGraphFunction(nested);assert.equal(n.code,'invalid_kind');assert.match(n.message,/\$\/template\/nodes\/0\/unknown/);
 assert.equal(schemaCheck('GraphFunction')(missing),false);assert.equal(schemaCheck('GraphFunction')(nested),false);
 for(const value of [NaN,Infinity,Number.MAX_SAFE_INTEGER+1,undefined,()=>{},new Date(),String.fromCharCode(0xd800)]){
  const malformed=clone(valid);malformed.declarations.bad=value;assert.equal(m01.admitGraphFunction(malformed).code,'non_canonical_value');
 }
 let invoked=false;const accessor=clone(valid);Object.defineProperty(accessor,'name',{enumerable:true,get(){invoked=true;throw new Error('do not execute');}});
 assert.equal(m01.admitGraphFunction(accessor).code,'non_canonical_value');assert.equal(invoked,false);
 const sparse=clone(valid);sparse.tags=Array(1);assert.equal(m01.admitGraphFunction(sparse).code,'non_canonical_value');
 const symbol=clone(valid);symbol[Symbol('host')]=true;assert.equal(m01.admitGraphFunction(symbol).code,'non_canonical_value');
 assert.throws(()=>admitIJsonText('{"kind":"graph_function","kind":"graph_function"}'),/duplicate object property/);
 const pub=clone(corpus.programs[0].packet.publication);pub.rules[0].config.extra={opaque:[true,null,3,{kept:'value'}]};
 const admittedPub=admitted(m02.admitModule(pub),'opaque-data');assert.deepEqual(admittedPub.value.rules.find(x=>x.name===pub.rules[0].name).config.extra,pub.rules[0].config.extra);
 const missingPublication=clone(pub);delete missingPublication.productSemanticsBinding.namedSymbol;
 assert.equal(m02.admitModule(missingPublication).code,'invalid_kind');assert.equal(schemaCheck('ModulePublication')(missingPublication),false);
});

test('GraphFunction/module and all application variants preserve authored data and canonical identities',()=>{
 const base=clone(corpus.programs[0].packet.publication.graphFunctions[0]);
 const common={kind:'graph_function_application',applicationRef:'application://local',inputContractRef:base.inputs[0],outputContractRef:base.outputs[0]};
 const variants=[
  {relationKind:'compose',leftGraphFunctionRef:base.name,rightGraphFunctionRef:base.name},
  {relationKind:'substitute',outerGraphFunctionRef:base.name,targetVectorRef:'vector://local',innerGraphFunctionRef:base.name},
  {relationKind:'recurse',graphFunctionRef:base.name,terminationRuleRef:'rule://local',terminationEvaluatorRefs:['evaluator://local'],terminationFieldRef:'field://local',foldbackRef:'foldback://local',foldback:{mode:'rebind',binding:'binding://local',requiresParentEvaluation:true},bound:2},
  {relationKind:'fan_out',batchRef:'batch://local',elementGraphFunctionRef:base.name,inputVectorRef:'vector://input',outputVectorRef:'vector://output',inputMemberContractRef:base.inputs[0],outputMemberContractRef:base.outputs[0]},
  {relationKind:'fan_in',reducerGraphFunctionRef:base.name,inputVectorRef:'vector://input'},
  {relationKind:'gate',targetRef:base.name,ruleRef:'rule://local',evaluatorRefs:['evaluator://local']},
  {relationKind:'registered_selection',sourceProgramLocusRef:'locus://local',evaluatorRef:'evaluator://local',ruleRef:'rule://local'},
  {relationKind:'re_enter',graphFunctionRef:base.name,sourceProgramLocusRef:'locus://source',targetProgramLocusRef:'locus://target',maxApplications:2},
  {relationKind:'promote',sourceRef:'source://local',targetRef:'target://local'},
  {relationKind:'identity',targetRef:'target://local'},
  {relationKind:'same_object',leftRef:'left://local',rightRef:'right://local',witnessRef:'witness://local'},
 ];
 for(const variant of variants){const value=clone(base);value.template.applications=[{...common,...variant}];
  const first=admitted(m01.admitGraphFunction(value),variant.relationKind),text=m01.serializeGraphFunction(first.value),second=admitted(m01.admitGraphFunction(admitIJsonText(text)),variant.relationKind);
  assert.equal(first.subjectDigest,second.subjectDigest);assert.deepEqual(first.value.template.applications,second.value.template.applications);
  assert.equal(schemaCheck('GraphFunction')(second.value),true);
  const malformed=clone(value);malformed.template.applications[0].unknown=true;assert.equal(m01.admitGraphFunction(malformed).code,'invalid_kind');assert.equal(schemaCheck('GraphFunction')(malformed),false);
 }
 const first=admitted(m02.admitModule(corpus.programs[0].packet.publication),'module'),text=m02.serializeModule(first.value),second=admitted(m02.admitModule(admitIJsonText(text)),'module-roundtrip');
 assert.equal(first.subjectDigest,second.subjectDigest);assert.equal(first.subjectDigest,sha256Canonical(first.value));
 assert.deepEqual(first.value,second.value);assert.equal(schemaCheck('ModulePublication')(second.value),true);
 const basis={productId:manifest.productId,artifactDigest:first.value.artifactDigest,productContentDigest:manifest.productContentDigest,
  productManifestDigest:hash(fs.readFileSync(path.join(root,'product-toolchain-manifest.json'))),packageName:manifest.packageName,packageVersion:manifest.packageVersion};
 for(const construct of [gtl.constructRequirementHandoffModulePublication,gtl.constructSemanticStageModulePublication,gtl.constructSemanticRevisionModulePublication]){
  const publication=construct(basis),roundtrip=admitted(m02.admitModule(admitIJsonText(m02.serializeModule(publication))),'optional-publication');
  assert.deepEqual(roundtrip.value,admitted(m02.admitModule(publication),'original-optional-publication').value);
  assert.equal(schemaCheck('ModulePublication')(roundtrip.value),true);
 }
});
