import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {here,read,write,verificationRequest,schemaVersion,caller} from './ordinary-caller.mjs';
import {loadRuntime} from './public-support.mjs';
import {checkStart,checkConformance} from './owner-checks.mjs';
export function inputFor(gtl,row){
 const v=row.variant;
 if(row.case.startsWith('recursive'))return gtl.constructBoundedRecursionState(v.remaining,v.blockedChildRemaining);
 if(row.case==='ordered-vector'||row.case==='partial-vector')return gtl.constructFanOutHelloInput(v.subjects,v.blockedOrdinal);
 return gtl.constructHelloWorldInput(v.subject);
}
export async function preflight(deadline){
 const identity=await read(join(here,'selected-core.json')),prospect=await read(join(here,'prospective-cases.json')),r=await loadRuntime(identity.installedRoot),{product,gtl,abg}=r;
 const manifest=await read(join(identity.installedRoot,'product-toolchain-manifest.json'));assert.equal(product.sha256Canonical(manifest),identity.basis.manifestDigest);
 const packet={kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',request:verificationRequest(prospect.core)},began=performance.now();
 const verification=await product.ProductVerificationPort.verify(packet);await write('live-product-verification.json',verification);await write('live-product-verification-timing.json',{elapsedMs:performance.now()-began});assert.equal(verification.kind,'product_verification_success');assert.strictEqual(product.selectOwnedProductVerification(packet.request,verification.verifiedArtifact),verification.verifiedArtifact);
 const c=await caller('s02',verification,deadline);const initial=await c.physical('initial');assert.equal(initial.bytes,2701191);assert.equal(initial.sha256,'c4c1c28232cd3a89d7233a03485c113e2f2df0c76d7a9432ca9d610c56c2aa90');assert.equal(initial.device,16777230);assert.equal(initial.inode,464244056);
 assert.equal(c.state.environment.workspaceBinding.authorizedActorRef,c.op.actorRef);assert.deepEqual(c.state.environment.resolvedProductLock,c.state.resolvedLock);
 assert.ok(c.state.environment.productInstalls.some(i=>i.installedRoot===identity.installedRoot&&i.productContentDigest===identity.basis.productContentDigest));
 const expected=verification.verifiedArtifact.contributionManifest.publicationBindings.map(p=>[p.moduleRef,p.publicationDigest].join('\0')).sort(),actual=c.state.catalog.boundPublications.map(p=>[p.moduleRef,product.modulePublicationSemanticDigest(p)].join('\0')).sort();assert.equal(actual.length,11);assert.deepEqual(actual,expected);
 const hello=c.state.catalog.boundPublications.find(p=>p.moduleRef==='module://abiogenesis/conformance/hello-world@5');assert.ok(hello);const raw=r.validator.rawAdmitValue(hello,'module_publication','contract://abiogenesis/gtl/module-publication@5');assert.equal(raw.kind,'raw_admitted_value');const contributions=hello.contributions.map(x=>r.validator.rawAdmitValue(x,'catalog_contribution','contract://abiogenesis/gtl/catalog-contribution@5'));assert.ok(contributions.every(x=>x.kind==='raw_admitted_value'));const validation=r.validator.validatePublication(raw,contributions);assert.equal(validation.kind,'publication_validation');
 const publicationInputs={modulePublications:c.state.catalog.boundPublications};const rows=[];const originalView=c.state.catalogView;
 for(const programRef of prospect.groups){
  const cases=prospect.cases.filter(x=>x.programRef===programRef),allowlist=cases[0].allowlist;assert.ok(cases.every(x=>JSON.stringify(x.allowlist)===JSON.stringify(allowlist)));
  c.state.catalogView=product.narrowGraphFunctionCatalog(c.state.catalog,allowlist);const conformance=await c.prepareConformance(programRef,'pure-'+cases[0].case,publicationInputs);const conformanceCheck=checkConformance(c,conformance);
  for(const row of cases){
   const input=inputFor(gtl,row),selected=await c.prepareStart(row.programRef,row.graphFunctionRef,input,'pure-'+row.case);const leaves=[...selected.resolution.programValidation.executableLeafRows,...selected.resolution.programValidation.interactionLeafRows];assert.ok(leaves.length>0&&leaves.every(x=>x.fibre==='F_D'),'selected declaration closure entirely F_D; no transport/actor dispatch allowed');
   const startCheck=await checkStart(c,selected);assert.equal(startCheck.existingProductPreparation.runEnvironment,null);
   rows.push({case:row.case,programRef:row.programRef,graphFunctionRef:row.graphFunctionRef,input,allSelectedLeavesFD:true,selectedLeafRows:leaves,program:conformance.program,ownerCheck:startCheck,expected:row.expected,oracle:row.oracle,viewDigest:c.state.catalogView.viewDigest});
  }
 }
 c.state.catalogView=originalView;assert.equal(c.state.calls.length,0);await write('pure-preflight.json',{status:'passed',subject:identity.basis,installedRoot:identity.installedRoot,workspaceBinding:c.state.binding,admittedInstallCoordinates:c.state.environment.productInstalls.map(product.productInstallCoordinate),catalogBasisDigest:c.state.catalog.basisDigest,completePublicationBindings:actual,helloRawStaticDisposition:validation.kind,initialHandoff:c.state.closeHandoff,rows,nativeEffects:0,providerCalls:0,modelCalls:0,inputSource:'actual package-declared GTL constructors; fan-out member refs belong to that constructor rather than the older donor caller'});
 console.log(JSON.stringify({phase:'PURE_PREFLIGHT_PASSED',cases:rows.length,allSelectedLeavesFD:true,nativeEffects:0}));return {c,verification,identity,prospect,publicationInputs,rows};
}
