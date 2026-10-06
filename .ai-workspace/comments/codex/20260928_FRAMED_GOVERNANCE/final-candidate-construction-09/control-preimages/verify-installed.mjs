import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const D=dirname(import.meta.dirname), read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const save=(name,value)=>fs.writeFileSync(join(D,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const operationBasisBytes=fs.readFileSync(join(D,'controls/operation-basis.json'));
assert.equal(createHash('sha256').update(operationBasisBytes).digest('hex'),'54e2cbf171123dc89b4a816d0d3cc598202fa53722ffe1821ec0488f40bd3db7');
const operationBasis=JSON.parse(operationBasisBytes.toString('utf8'));
assert.equal(operationBasis.effectTerritory,D);
assert.equal(read(join(D,'activation.json')).activation,operationBasis.operation);
assert.equal(read(join(D,'activation.json')).actor,operationBasis.actor);
assert.equal(read(join(D,'construction-execution-grant.json')).actor,operationBasis.actor);
assert.equal(read(join(D,'construction-execution-grant.json')).activation,operationBasis.operation);
const identity=read(join(D,'final-package-identity.json')),pkg=read(join(identity.packageRoot,'package.json'));
const load=name=>import(pathToFileURL(join(identity.packageRoot,pkg.exports['./'+name].import)).href);
const [product,publicApi]=await Promise.all(['product','public'].map(load));
const reads=await import(pathToFileURL(join(identity.packageRoot,'build/code/src/abg/project_read_operation_contracts.js')));
const manifest=read(join(identity.packageRoot,'product-toolchain-manifest.json'));
const request={artifactPath:identity.artifactPath,artifactRef:pathToFileURL(identity.artifactPath).href,
  expectedArtifactDigest:identity.artifactDigest,expectedProductContentDigest:manifest.productContentDigest,
  expectedManifestDigest:product.sha256Canonical(manifest),expectedProductId:manifest.productId,
  expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion};
const packet={kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request};
save('final-product-verification-request.json',packet); const began=performance.now();
const verification=await product.ProductVerificationPort.verify(packet);
save('final-product-verification-timing.json',{elapsedMs:performance.now()-began,kind:verification.kind,memory:process.memoryUsage()});
if(verification.kind!=='product_verification_success') { save('final-product-verification-failure.json',verification); throw Error(verification.kind); }
const owned=verification.verifiedArtifact;
assert.strictEqual(product.selectOwnedProductVerification(request,owned),owned);
assert.equal(owned.productId,manifest.productId); assert.equal(owned.packageVersion,pkg.version);
assert.equal(owned.packageName,pkg.name); assert.equal(owned.packageVersion,'5.0.0-rc.1');
const operation=owned.definitionContractCoordinates.operations.find(o=>o.operationId==='abg.operation.project.read'); assert.ok(operation);
const member=operation.members.find(m=>m.memberKey==='run_gaps'); assert.ok(member);
const definition=publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===operation.operationId&&d.definitionKey.memberKey===member.memberKey); assert.ok(definition);
assert.equal(reads.ABG_PROJECT_READ_CONTRACTS.run_gaps.definitionKey.memberKey,'run_gaps');
const stagedFamily=await import(pathToFileURL(join(D,'final-stage/build_tenants/abiogenesis/typescript/build/code/src/public/index.js')));
const stagedDefinition=stagedFamily.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===operation.operationId&&d.definitionKey.memberKey===member.memberKey);
assert.ok(stagedDefinition);
assert.equal(definition.definitionRef,stagedDefinition.definitionRef);
assert.equal(definition.definitionDigest,stagedDefinition.definitionDigest,'installed/staged actual semantic definition identity');
assert.equal(definition.executionBindingSpecificationDigest,stagedDefinition.executionBindingSpecificationDigest);
assert.equal(owned.catalogDigest,manifest.publicContractCatalog.catalogDigest);
const selected={packageRoot:identity.packageRoot,artifactPath:identity.artifactPath,artifactRef:request.artifactRef,
  basis:{artifactDigest:owned.artifactDigest,productContentDigest:owned.productContentDigest,manifestDigest:owned.manifestDigest,
    productId:owned.productId,packageName:owned.packageName,packageVersion:owned.packageVersion}};
save('final-selected-core.json',selected);
save('final-product-verification-summary.json',{kind:verification.kind,coordinates:verification.coordinates,
  verificationRef:owned.verificationRef,verificationDigest:owned.verificationDigest,basis:selected.basis,
  contributionManifestDigest:owned.contributionManifestDigest,catalogDigest:owned.catalogDigest,
  publicationBindings:owned.contributionManifest.publicationBindings,ownerSelection:'same nominal verified artifact in process',
  limit:'Physical archive verification by installed owner; retained JSON is not nominal authority, admitted ProductInstall or qualification.'});
save('final-reader-binding.json',{packageRoot:identity.packageRoot,publicApi:{path:join(identity.packageRoot,pkg.exports['./public'].import)},
  productGrantConstructor:{path:join(identity.packageRoot,pkg.exports['./product'].import),export:'constructCapabilityGrant'},
  fixedPacket:{path:join(identity.packageRoot,'build/code/src/abg/project_read_operation_contracts.js'),export:'ABG_PROJECT_READ_CONTRACTS',memberKey:'run_gaps'},
  definition:{ref:definition.definitionRef,digest:definition.definitionDigest},contractCatalogOverride:member.slots.request.contractCatalog,
  definitionContractCoordinatesOverride:owned.definitionContractCoordinates,
  manifest:{path:join(identity.packageRoot,'product-toolchain-manifest.json'),digest:owned.manifestDigest},
  nextCaller:'ordinary installed owner invocation after Executive conjoins candidate; explicitly supply current assertions for dependent qualification work',nativeCalls:0});
save('final-package-readiness.json',{status:'PHYSICAL_VERIFICATION_COMPLETE_PENDING_FULL_PUBLICATIONS',identity,selected,
  sourceFreezeSHA256:product.sha256Bytes(fs.readFileSync(join(D,'final-source-freeze-manifest.json'))),
  sourceMembers:read(join(D,'final-source-members.json')).length,
  generated:read(join(D,'final-generated-summary.json')),installedVerification:true,admittedInstall:false,nativePublicCall:false,qualification:false});
console.log(JSON.stringify(selected));
