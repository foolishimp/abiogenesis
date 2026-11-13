// Pure existing constructors only. No Public/Runtime/store/provider/install effects.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url)),json=async p=>JSON.parse(await readFile(p,'utf8'));
const c=await json(join(dir,'setup-config.json')),s=await json(join(dir,'SOURCE_BINDINGS.json'));
const load=p=>import(pathToFileURL(join(c.bootstrapRoot,'build/code/src',p+'.js')).href);
const gtl=await load('gtl/index'),product=await load('product/index'),start=await load('gtl/public_start');
const {consumerDeclaration}=await import(pathToFileURL(s.operatorReferences.find(x=>x.path.endsWith('/consumer.mjs')).path).href);
const prior=await json(s.purePriorAcquisition.path),verified=prior.verification.verifiedArtifact;
assert.equal(verified.artifactDigest,'sha256:'+c.builder.archiveSha256);
const library=gtl.constructDefaultGovernanceLibraryModulePublication({...verified,productManifestDigest:verified.manifestDigest});
const four=consumerDeclaration(gtl,product,library,4),eight=consumerDeclaration(gtl,product,library,8);
assert.equal(product.sha256Canonical(four),product.sha256Canonical(await json(s.actualPriorConsumer.path)));
assert.equal(product.sha256Canonical(eight),c.expectedConsumerDeclarationDigest);
const selection=start.resolveProgramStart(eight.programs[0],{scope:'program',target:'next',until:'converged',rootMode:'direct'});
assert.equal(selection.kind,'resolved_program_start');
console.log(JSON.stringify({status:'PURE_OWNER_BOUND8_READY',sourceCommit:c.sourceCommit,priorBound4MatchesActualConsumer:true,priorDeclarationDigest:product.sha256Canonical(four),proposedDeclarationDigest:product.sha256Canonical(eight),programObjectUnchanged:product.sha256Canonical(four.programs)===product.sha256Canonical(eight.programs),entryResolution:selection,PublicRuntimeProviderInstallBuildCalls:0,meaning:'Pure construction/control readiness only; actual new consumer package/install/catalog/conformance remains Root-owned.'},null,2));
