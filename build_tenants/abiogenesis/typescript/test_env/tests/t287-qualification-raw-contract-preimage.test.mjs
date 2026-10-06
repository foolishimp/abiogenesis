// Source/component regression. Native admission and installed-content authentication
// are supplied lower premises; declaration lookup and raw verification stay real.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {performance} from 'node:perf_hooks';
import * as product from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/self_conformance.js';
import {resolveExecutionDeclarationClosure} from '../../build/code/src/product/declaration_closure.js';
import {ABI5_SELF_CONFORMANCE_PRODUCT_SEMANTICS} from '../../build/code/src/validator/self_conformance_semantics.js';

const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const hash=product.sha256Canonical;

test('qualification F_P publication supplies the exact raw owner to real singleton and mixed native preimage verification',async t=>{
  const names=['ABI5_QUAL_RAW_COORDINATES','ABI5_QUAL_RAW_INPUT_PACKET','ABI5_QUAL_RAW_REQUEST','ABI5_QUAL_RAW_BODY','ABI5_QUAL_RAW_BASELINE_TENANT'];
  if(names.some(n=>!process.env[n]))return t.skip('requires explicit frozen qualification and failed-Runtime preimages; no current installation is inferred');
  const start=performance.now(),coords=await read(process.env.ABI5_QUAL_RAW_COORDINATES),packet=await read(process.env.ABI5_QUAL_RAW_INPUT_PACKET),request=await read(process.env.ABI5_QUAL_RAW_REQUEST),raw=await read(process.env.ABI5_QUAL_RAW_BODY);
  const input=packet.assessmentInput,q=gtl.QUALIFICATION_IDS;
  assert.equal(request.inputDigest,hash(input));assert.equal(request.instructionContractRef,q.assessmentInput);assert.equal(request.resultContractRef,q.assessmentRaw);
  assert.equal(ABI5_SELF_CONFORMANCE_PRODUCT_SEMANTICS.validateContractValue('qualification_raw_judgment',raw),true);
  assert.equal(raw.criteria.every(c=>c.disposition==='indeterminate'&&c.applicability==='unknown'&&c.grouping==='unknown'),true);
  const retained=coords.catalog.boundPublications.find(p=>p.moduleRef===gtl.SELF_CONFORMANCE_IDS.moduleRef);assert.ok(retained);
  const artifact={artifactDigest:retained.artifactDigest,productContentDigest:retained.productContentDigest,productManifestDigest:retained.productManifestDigest,productId:retained.owningProductId,packageName:retained.productSemanticsBinding.packageName,packageVersion:retained.productSemanticsBinding.packageVersion};
  const baseline=await import(pathToFileURL(join(process.env.ABI5_QUAL_RAW_BASELINE_TENANT,'build/code/src/gtl/self_conformance.js')).href);
  const old=baseline.constructSelfConformanceModulePublication(artifact),current=gtl.constructSelfConformanceModulePublication(artifact);
  assert.equal(product.modulePublicationSemanticDigest(old),product.modulePublicationSemanticDigest(retained));
  assert.equal(old.graphFunctions.find(g=>g.name===q.assessGraph).declarations['abg.raw_result_contract'],undefined);
  assert.equal(current.graphFunctions.find(g=>g.name===q.assessGraph).declarations['abg.raw_result_contract'],q.assessmentRaw);
  assert.deepEqual(current.graphFunctions.filter(g=>g.name!==q.assessGraph),old.graphFunctions.filter(g=>g.name!==q.assessGraph),'F_D/F_H and unrelated graph bodies remain exact');
  const untouched={...current,graphFunctions:current.graphFunctions.map(g=>g.name===q.assessGraph?{...g,declarations:Object.fromEntries(Object.entries(g.declarations).filter(([k])=>k!=='abg.raw_result_contract'))}:g)};
  assert.equal(product.modulePublicationSemanticDigest(untouched),product.modulePublicationSemanticDigest(old),'the raw declaration is the complete publication delta');
  const parent=coords.catalog.boundPublications.find(p=>p.programs.some(p=>p.programRef==='program://abiogenesis-fixture/f11-carrier/parent@5'));assert.ok(parent);
  // Retain the complete actual Catalog/publication roster and its immutable
  // wrapper import. Source re-readiness and owner installation are supplied
  // component facts here; this is not an admission into that actual Catalog.
  function closure(publication,route,{ambient=false}={}){
    let publications=coords.catalog.boundPublications.map(p=>p.moduleRef===retained.moduleRef?publication:p);
    if(ambient){
      const ghost={...publication.graphFunctions.find(g=>g.name===q.assessGraph),name:'graph-function://component/ambient-unrelated@5',declarations:{'abg.raw_result_contract':'contract://component/ambient-unavailable@5'}};
      publications=publications.map(p=>p.moduleRef===publication.moduleRef?{...p,graphFunctions:[...p.graphFunctions,ghost]}:p);
    }
    const base=product.buildGraphFunctionCatalog(publications);
    if(base.kind!=='graph_function_catalog')return {refusal:base};
    const catalog={...coords.catalog,...base,boundPublications:publications,readinessBasis:{...coords.catalog.readinessBasis,publications}};
    const catalogView=product.narrowGraphFunctionCatalog(catalog,coords.catalogView.allowlist);assert.equal(catalogView.kind,'graph_function_catalog_view');
    const programRef=route==='mixed'?'program://abiogenesis-fixture/f11-carrier/parent@5':'program://abiogenesis/qualification/assess@5';
    const graphRef=route==='mixed'?'graph-function://abiogenesis-fixture/f11-carrier/parent@5':q.assessGraph;
    const selected=resolveExecutionDeclarationClosure(catalog,catalogView,programRef,graphRef);
    return {selected,catalog,catalogView,publications};
  }
  async function leafPort(c){
    assert.equal(c.selected.kind,'resolved_execution_declaration_closure',JSON.stringify(c.selected));
    const publication=c.selected.publications.find(p=>p.moduleRef===retained.moduleRef),install=coords.catalog.readinessBasis.installedProducts.find(i=>i.productId===publication.owningProductId);assert.ok(install);
    const binding=publication.implementationBindings.find(b=>b.implementationRef===q.assessImplementation),pd=product.modulePublicationSemanticDigest(publication),graph=publication.graphFunctions.find(g=>g.name===q.assessGraph);
    const row={...binding,implementationBindingRef:binding.bindingRef,implementationOwnerProductId:install.productId,implementationPublicationDigest:pd,graphFunctionRef:q.assessGraph,programLocusRef:graph.template.nodes[0].nodeRef};
    const set={rows:[row],implementationSetRef:'implementation-set://component/qualification-raw',implementationSetDigest:hash([row]),invocationAdmissionRef:'supplied-component-premise://no-native-admission',invocationRef:'invocation://component/qualification-raw'};
    const owner=c.selected.graphFunctionOwners.find(o=>o.declarationRef===q.assessGraph);assert.ok(owner);
    const projection={...install,publicationDigest:pd,bindingRef:publication.productSemanticsBinding.bindingRef};
    const file=resolve(import.meta.dirname,'../../build/code/src/implementation/leaf_invocation_port.js'),module=new SourceTextModule(await fs.readFile(file,'utf8'),{identifier:file});
    const overrides={
      '../abg/environment_admission.js':{hasAdmittedProductInstall:()=>true},
      '../abg/execution_basis.js':{hasAdmittedImplementationSetAtPrefix:()=>true},
      '../product/semantics.js':{inspectProductLeafSemanticsProjection:()=>({projection,runtime:{...ABI5_SELF_CONFORMANCE_PRODUCT_SEMANTICS,verifyInstalledContent:async()=>true}})},
    };
    await module.link(async spec=>{
      const loaded=await import(spec.startsWith('node:')?spec:pathToFileURL(resolve(dirname(file),spec)).href),values={...loaded,...overrides[spec]};
      return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});
    });
    await module.evaluate();
    const port=await module.namespace.constructAdmittedLeafInvocationPort({prefix:{},artifactTruth:{},implementationSet:set,semanticsProjection:projection,graphFunctionRef:q.assessGraph,executionResolution:{declarationClosure:c.selected,declarationPublications:c.selected.publications,ownerInstalls:coords.catalog.readinessBasis.installedProducts.filter(i=>c.selected.publications.some(p=>p.owningProductId===i.productId))}});
    const preimage={resolution:row,input,inputDigest:hash(input),instructionContractRef:request.instructionContractRef,rawResultContractRef:request.resultContractRef,rawResult:raw};
    return {port,preimage};
  }
  const rows=[];
  for(const route of ['singleton','mixed']){
    const prior=closure(old,route);assert.equal(prior.selected.kind,'resolved_execution_declaration_closure');
    assert.equal(prior.selected.contractOwners.filter(o=>o.declarationRef===q.assessmentRaw).length,0);
    const before=await leafPort(prior),failed=before.port.verifyProbabilisticResultContractPreimage(before.preimage);
    assert.equal(failed.kind,'probabilistic_result_contract_preimage_refusal');assert.equal(failed.code,'result_contract_refused');
    const after=closure(current,route);assert.equal(after.selected.kind,'resolved_execution_declaration_closure');
    const owners=after.selected.contractOwners.filter(o=>o.declarationRef===q.assessmentRaw);assert.equal(owners.length,1);assert.equal(owners[0].productId,retained.owningProductId);
    if(route==='mixed')assert.equal(after.selected.publications.some(p=>product.modulePublicationSemanticDigest(p)===product.modulePublicationSemanticDigest(parent)),true,'unchanged wrapper import participates in exact dependency closure');
    const positive=await leafPort(after),verified=positive.port.verifyProbabilisticResultContractPreimage(positive.preimage);
    assert.equal(verified.kind,'verified_probabilistic_result_contract_preimage');assert.equal(verified.rawResultContractRef,q.assessmentRaw);assert.equal(verified.rawResultDigest,hash(raw));
    rows.push({route,baseline:'result_contract_refused',postimage:verified.kind,rawOwner:owners[0],publicationDigest:product.modulePublicationSemanticDigest(current)});
    const refuse=(label,patch,code)=>{const r=positive.port.verifyProbabilisticResultContractPreimage({...positive.preimage,...patch});assert.equal(r.kind,'probabilistic_result_contract_preimage_refusal',label);assert.equal(r.code,code,label);rows.push({route,label,refused:r.code});};
    refuse('malformed raw body',{rawResult:{...raw,kind:'foreign_raw_kind'}},'result_contract_refused');
    refuse('crossed input digest',{inputDigest:hash('crossed request input')},'input_contract_refused');
    refuse('crossed instruction contract',{instructionContractRef:q.verdictInput},'contract_identity_mismatch');
    refuse('crossed raw contract',{rawResultContractRef:q.judgment},'contract_identity_mismatch');
    const missing={...current,contracts:current.contracts.filter(c=>c.contractRef!==q.assessmentRaw)},absent=closure(missing,route);
    assert.equal(absent.refusal?.disposition==='refused'||absent.selected?.kind==='execution_declaration_closure_refusal',true,'missing raw declaration owner refuses');
    const duplicate={...current,contracts:[...current.contracts,current.contracts.find(c=>c.contractRef===q.assessmentRaw)]},nonunique=closure(duplicate,route);
    assert.equal(nonunique.refusal?.disposition==='refused'||nonunique.selected?.kind==='execution_declaration_closure_refusal',true,'nonunique raw owner refuses');
    rows.push({route,label:'missing owner',refused:absent.refusal?.code??absent.selected.code},{route,label:'nonunique owner',refused:nonunique.refusal?.code??nonunique.selected.code});
    const incompatible=closure({...current,productManifestDigest:hash('crossed Source owner manifest')},route);
    assert.equal(incompatible.refusal?.disposition==='refused'||incompatible.selected?.kind==='execution_declaration_closure_refusal',true,'incompatible owner manifest refuses');
    rows.push({route,label:'incompatible owner',refused:incompatible.refusal?.code??incompatible.selected.code});
    const isolated=closure(current,route,{ambient:true});assert.equal(isolated.selected.kind,'resolved_execution_declaration_closure');
    const roster=owners=>owners.map(({publicationDigest,...coordinate})=>coordinate);
    assert.deepEqual(roster(isolated.selected.contractOwners),roster(after.selected.contractOwners),'unselected ambient GraphFunction adds no selected contract dependency');
    for(const owner of isolated.selected.contractOwners){
      const matches=isolated.selected.publications.filter(p=>p.moduleRef===owner.moduleRef&&p.owningProductId===owner.productId);
      assert.equal(matches.length,1);assert.equal(owner.publicationDigest,product.modulePublicationSemanticDigest(matches[0]),'each owner binds the actual changed publication');
    }
    rows.push({route,label:'unrelated ambient graph',outcome:'selected owner roster conserved; each owner binds its actual publication digest'});
  }
  const report={status:'passed',cases:rows.length,rows,inputDigest:hash(input),rawDigest:hash(raw),requestDigest:hash(request),rawBytes:Buffer.byteLength(JSON.stringify(raw)),rawDisposition:'indeterminate/unknown preserved',realOwners:['buildGraphFunctionCatalog','narrowGraphFunctionCatalog','resolveExecutionDeclarationClosure','LeafInvocationPort exact unique owner lookup','verifyProbabilisticResultContractPreimage','qualification raw schema and worker-contract selector'],suppliedLowerPremises:['Catalog readiness/workspace/install/lock record fields reused as source-component premises, not newly admitted','product/implementation-set admission booleans supplied by existing F04 VM scaffold','loaded semantics projection and installed-content authentication supplied; actual qualification validators and worker-contract selection remain unchanged'],ownerLookupOrVerifierMocked:false,verificationPreimageSupplied:false,actualInstallOrAdmission:false,helperProviderOrRuntimeCalls:0,requiredNext:'Root accepted successor construction/install and actual whole child-J-foldback/F11/AF22 proof',elapsedMs:performance.now()-start,processUsage:process.resourceUsage()};
  t.diagnostic(JSON.stringify(report));
  if(process.env.ABI5_QUAL_RAW_REPORT)await fs.writeFile(process.env.ABI5_QUAL_RAW_REPORT,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
});
