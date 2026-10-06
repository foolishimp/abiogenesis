from pathlib import Path
import hashlib,json
D=Path(__file__).resolve().parent;G=D.parent;O=G/'rc1-s03-installed-execution-03'
s=(O/'driver.mjs').read_text()
s=s.replace("const D=import.meta.dirname,G=dirname(D),C=join(G,'final-candidate-construction-03');", "const D=import.meta.dirname,G=dirname(D),C=join(G,'final-candidate-construction-03'),O=join(G,'rc1-s03-installed-execution-03');")
a=s.index('async function setup(){');b=s.index('\ntry{\n const {workspaceAuthority,prospect}=await setup();',a)
setup=r'''async function setup(){
 const identity=await read(join(D,'selected-core.json')),prospect=await read(join(D,'prospective-cases.json'));
 const r=await loadRuntime(identity.installedRoot),{product,abg}=r;
 const oldBind=(await read(join(O,'s03-bind.jsonl'))).invocation.resources;
 const oldConformance=(await read(join(O,'s03-conformance-s03.jsonl'))).invocation.resources;
 const oldInputs=await read(join(O,'publication-inputs.json'));
 const oldCatalog=(await read(join(O,'s03-catalog-stdout.json'))).receipt.ownerOutput.value;
 const oldView=(await read(join(O,'s03-catalog-view-stdout.json'))).receipt.ownerOutput.value;
 const oldViewCall=(await read(join(O,'s03-catalog-view.jsonl'))).invocation.invocation;
 const closeHandoff=await read(join(O,'failure-final-handoff.json'));
 const binding=(await read(join(O,'s03-bind-stdout.json'))).receipt.ownerOutput.value.binding;
 const environment=abg.projectExactPrefixWorkspaceEnvironment(closeHandoff.prefix,binding);
 assert.equal(environment.kind,'exact_prefix_workspace_environment',JSON.stringify(environment));
 assert.deepEqual(environment.workspaceAuthorityBasis,oldBind.workspaceAuthority);
 assert.deepEqual(environment.resolvedProductLock,oldBind.resolvedLock);
 assert.deepEqual(environment.productInstalls,oldBind.admittedInstalls);
 const corePacket={kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',request:verificationRequest(prospect.core)};
 progress('same-process-core-verification');
 const coreVerification=await verifyInstalledCurrent({product,packet:corePacket,expected:prospect.core.basis});
 items=[{name:'core',...prospect.core,verification:coreVerification,verified:coreVerification.verifiedArtifact}];
 const fixturePacket={kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',request:verificationRequest(prospect.fixture)};
 progress('same-process-unchanged-fixture-verification');
 const fixtureVerification=await product.ProductVerificationPort.verify(fixturePacket);
 assert.equal(fixtureVerification.kind,'product_verification_success',JSON.stringify(fixtureVerification));
 assert.strictEqual(product.selectOwnedProductVerification(fixturePacket.request,fixtureVerification.verifiedArtifact),fixtureVerification.verifiedArtifact);
 for(const [key,value] of Object.entries(prospect.fixture.basis))assert.deepEqual(fixtureVerification.verifiedArtifact[key],value,key);
 items.push({name:'fixture',...prospect.fixture,verification:fixtureVerification,verified:fixtureVerification.verifiedArtifact});
 await save('same-process-verification.json',items.map(({name,verification,verified})=>({name,kind:verification.kind,coordinates:verification.coordinates,
  artifactDigest:verified.artifactDigest,productContentDigest:verified.productContentDigest,manifestDigest:verified.manifestDigest,
  ownerSelection:'Same actual nominal object in this process; no saved body is treated as nominal authority.',role:'pure preparatory owner verification; no Public CLI setup rerun'})));
 c=await caller('s03',coreVerification,deadline,D,environment.workspaceBinding.authorizedActorRef);
 const {state}=c;
 state.closeHandoff=closeHandoff;state.binding=binding;state.resolvedLock=environment.resolvedProductLock;c.refresh();
 const constructorRows=(await read(join(C,'final-publication-bindings.json'))).constructorPopulation;
 const corePublications=constructorRows.map(row=>r.gtl[row.constructor]({...items[0].verified,productManifestDigest:items[0].verified.manifestDigest}));
 const originalPublication=await read(prospect.originalPublicationPreimage.path),fixtureBasis=items[1].verified;
 const fixturePublication=r.gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...structuredClone(originalPublication),
  artifactDigest:fixtureBasis.artifactDigest,productContentDigest:fixtureBasis.productContentDigest,productManifestDigest:fixtureBasis.manifestDigest,
  contributions:originalPublication.contributions.map(row=>({...structuredClone(row),provenanceRefs:[fixtureBasis.artifactDigest,fixtureBasis.manifestDigest]}))});
 const publications=[...corePublications,fixturePublication];
 assert.deepEqual(publications.map(p=>[p.owningProductId,p.moduleRef,product.modulePublicationSemanticDigest(p)].join('\0')).sort(),
  items.flatMap(i=>i.verified.contributionManifest.publicationBindings.map(p=>[i.verified.productId,p.moduleRef,p.publicationDigest].join('\0'))).sort());
 const publicationInputs={workspaceBinding:binding,descriptors:items.map(i=>i.verification.coordinates.descriptor),verifiedProducts:items.map(i=>i.verified),modulePublications:publications};
 assert.equal(c.hash(publicationInputs),c.hash(oldInputs),'pure fresh owner objects must reproduce the old producer publication input body');
 const installed=state.environment.productInstalls.map(i=>abg.projectAdmittedProductInstallByAdmissionEventRef(state.environment.artifactTruth,i.admissionEventRef));
 assert.ok(installed.every(Boolean));
 state.catalog=product.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion,memberKey:'admit',readinessBasis:{
  workspaceBinding:state.environment.workspaceBindingCandidate,resolvedLock:state.resolvedLock,
  verifiedProducts:publicationInputs.verifiedProducts,installedProducts:installed.map(i=>i.candidate),publications}});
 assert.equal(state.catalog.kind,'graph_function_catalog',JSON.stringify(state.catalog));
 assert.equal(state.catalog.basisDigest,oldCatalog.catalog.digest);
 assert.equal(c.hash(state.catalog),c.hash(oldConformance.declarationCatalog.catalog));
 state.catalogView=product.narrowGraphFunctionCatalog(state.catalog,oldViewCall.request.allowlist);
 assert.equal(state.catalogView.viewDigest,oldView.view.digest);
 assert.equal(c.hash(state.catalogView),c.hash(oldConformance.declarationCatalog.catalogView));
 const program=fixturePublication.programs.find(p=>p.programRef==='program://s03-automatic/root@5');assert.ok(program);
 assert.deepEqual(program,oldConformance.packet.program);
 assert.deepEqual(fixturePublication,oldConformance.packet.publication);
 await save('reused-setup.json',{previousActivation:'T287_RC1_S03_INSTALLED_PAIR_03',previousSetupCalls:9,
  oldFailureFreezeSHA256:'ba1fcefd7259d3641f187fcefb1e545f45dfecb321fb273b2ab5d1e04e7f59bd',
  closeHandoff,binding,resolvedLock:{ref:state.resolvedLock.lockId,digest:state.resolvedLock.lockDigest},
  actorRef:environment.workspaceBinding.authorizedActorRef,workspaceAuthority:oldBind.workspaceAuthority,
  catalog:oldCatalog.catalog,view:oldView.view,publicationInputDigest:c.hash(publicationInputs),
  publications:publications.length,ownerPublicationBindings:items.reduce((n,i)=>n+i.verified.contributionManifest.publicationBindings.length,0),
  nominalReacquisition:'Actual ProductVerificationPort.verify -> identical owner selection -> GTL publications -> actual pure CatalogOperationPort.admit/narrow -> old producer digest checks',
  setupCLIRepeated:0,storeCopied:false,newRequestNamespace:c.op.requestBaseRef});
 await save('publication-inputs.json',publicationInputs);
 const initial=await physical('original-continuation');
 assert.equal(initial.value.bytes,2490961);assert.equal(initial.value.device,16777230);assert.equal(initial.value.inode,464429281);
 assert.equal(initial.value.sha256,'3f4f443fe609b278d375e7667137e330fa25efcdc46c2297afc018bda4bc5298');
 progress('corrected-ordinary-public-conformance');
 await c.conformance(program.programRef,'conformance-s03',publicationInputs);c.refresh();
 assert.deepEqual(c.state.closeHandoff,closeHandoff,'eventless conformance conserves genuine handoff');
 await save('setup-state.json',{...state,workspaceAuthority:oldBind.workspaceAuthority,program,contractCatalog:c.contractCatalog,
  relation:'Nine setup CLI calls reused; only fresh corrected conformance invoked. Existing binding remains the actual authority.'});
 return {workspaceAuthority:oldBind.workspaceAuthority,prospect};
}'''
s=s[:a]+setup+s[b:]
old=" const replay=await import(pathToFileURL(join(c.packageIdentity.installedRoot,'build/code/src/abg/replay.js')).href);\n await save('proof-projector-binding.json',{path:join(c.packageIdentity.installedRoot,'build/code/src/abg/replay.js'),\n  export:'projectRunIdentityAtPrefix',role:'read-only existing replay owner projection for original causal oracle; no runtime admission/effect',\n  fixtureOriginalPureConstructors:prospect.originalFixtureImplementation});"
new=" await save('proof-projector-binding.json',{packageExport:'@abiogenesis/typescript-tenant/abg',\n  export:'projectRunTruthAtDurablePrefix',role:'Existing declared public ABG read-only exact-prefix Run truth supplies run/executionBasis to unchanged original causal oracle; no runtime admission/effect or private import',\n  fixtureOriginalPureConstructors:prospect.originalFixtureImplementation});"
assert old in s;s=s.replace(old,new)
old="const identity=replay.projectRunIdentityAtPrefix(prefix,started.receipt.resources.run.ref);assert.ok(identity);"
new="const identity=c.abg.projectRunTruthAtDurablePrefix(boundary.prefix,started.receipt.resources.run.ref);assert.equal(identity.kind,'abg_run_truth_projection',JSON.stringify(identity));"
assert old in s;s=s.replace(old,new)
s=s.replace("identity:'c03-s03-'", "identity:'c03-s03-04-'")
s=s.replace('T287_RC1_S03_INSTALLED_PAIR_03\',results','T287_RC1_S03_INSTALLED_PAIR_04\',results')
assert "activation:'T287_RC1_S03_INSTALLED_PAIR_04'" in s
with (D/'driver.mjs').open('x') as f:f.write(s)
launch=(O/'launch.py').read_text()
launch=launch.replace("'input-correspondence.json','initialize.py','launch.py'", "'input-correspondence.json','initialize.py','create-driver.py','conformance-resources.mjs','launch.py'")
launch=launch.replace("'original-consumers.mjs','sole-output-renderer.mjs']:", "'original-consumers.mjs','sole-output-renderer.mjs','conformance-resources.mjs']:")
with (D/'launch.py').open('x') as f:f.write(launch)
with (D/'driver-correspondence.json').open('x') as f:
 json.dump({'origin':str(O/'driver.mjs'),'originSHA256':hashlib.sha256((O/'driver.mjs').read_bytes()).hexdigest(),
  'newDriverSHA256':hashlib.sha256((D/'driver.mjs').read_bytes()).hexdigest(),
  'adaptations':['Reuse genuine closed setup, current bound environment and actual owner nominal/catalog reconstruction instead of setup replay',
   'Correct conformance through shared pure constructor in ordinary caller',
   'Use declared public projectRunTruthAtDurablePrefix for read-only original causal oracle input; no private projector import',
   'Unique activation-04 request identities and new report territory'],
  'originalOraclesAndConsumersUnchanged':True},f,indent=2);f.write('\n')
print(json.dumps({'status':'bounded_continuation_driver_prepared','setupCLIRepeated':0,'expectedNativeCalls':11}))
