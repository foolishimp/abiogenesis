import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {recordedPackedResource,assertPackedResourceCorrespondence} from './packed-resources.mjs';

const root=dirname(fileURLToPath(import.meta.url)),read=async path=>JSON.parse(await readFile(path,'utf8'));
const start=performance.now(),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function pinned(row){const bytes=await readFile(row.path);assert.equal(bytes.length,row.byteCount);assert.equal(hash(bytes),row.sha256);return JSON.parse(bytes.toString('utf8'));}
const selected=await read(join(root,'inputs.json')),host=await pinned(selected.host);
const ownerRoot=join(host.installedRoot,'build/code/src'),ownerPath=join(ownerRoot,'product/verification_definition_bindings.js');
const ownerBytes=await readFile(ownerPath),ownerText=ownerBytes.toString('utf8');
const shared=await import(pathToFileURL(join(ownerRoot,'shared/public_function_contracts.js')));
const p=await import(pathToFileURL(join(ownerRoot,'product/index.js')));
const v=createRequire(join(host.installedRoot,'package.json'))('valibot');
// Pure instrumentation evaluates the unchanged private schema/matcher source bytes.
// It does not execute an owner definition, verifier, transport, or admission.
const schemaText=ownerText.slice(ownerText.indexOf('const artifactResourceSchema'),ownerText.indexOf('const installManifestResourceSchema'));
const matcherText=ownerText.slice(ownerText.indexOf('function sameCoordinate'),ownerText.indexOf('function admitResources'));
assert(schemaText.startsWith('const artifactResourceSchema = v.strictObject('));
assert(matcherText.startsWith('function sameCoordinate('));
const schema=Function('v','absolutePathSchema','refDigestSchema','digestSchema','nonblankSchema',schemaText+'\nreturn artifactResourceSchema;')(v,shared.absolutePathSchema,shared.refDigestSchema,shared.digestSchema,shared.nonblankSchema);
const matchesRequest=Function(matcherText+'\nreturn artifactMatchesRequest;')();
const original=await readFile(join(root,'preimages/prepare.mjs'),'utf8');
const expression=original.match(/const v=item\.verified,pack=(\{[^\n]+\});packed\.push\(pack\);/)?.[1];assert(expression);
const originalResource=Function('item','const v=item.verified;return ('+expression+');');
const results=[];
for(const [i,pin] of [selected.acquisition,selected.consumerAcquisition].entries()){
 const frozen=await pinned(pin),item={...frozen,verified:frozen.verification.verifiedArtifact};
 const previous=selected.completedSetup.calls['product-verify-'+i],projection=await pinned(previous.projection),outcome=await pinned(previous.outcome);
 const request=projection.invocation.request,packed=recordedPackedResource(item,request);
 assert.equal(outcome.receipt.ownerOutput.outcomeKind,'result');assert.equal(outcome.receipt.ownerOutput.value.disposition,'locally_verified');
 assert.deepEqual(outcome.receipt.ownerOutput.value.verifiedArtifact,item.verification.coordinates.verifiedArtifact);
 assert.equal(shared.admitRuntimeContract(schema,packed).disposition,'admitted');
 assert(matchesRequest(packed,{invocation:{request}}));
 assert(v.safeParse(p.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify.requestSchema,request).success);
 const bad=originalResource(item);
 assert.notEqual(shared.admitRuntimeContract(schema,bad).disposition,'admitted');
 assert.equal(matchesRequest(bad,{invocation:{request}}),false);
 assert.throws(()=>assertPackedResourceCorrespondence(item,request,bad));
 const wrongContent={...packed,productContent:bad.productContent};
 assert.equal(shared.admitRuntimeContract(schema,wrongContent).disposition,'admitted');
 assert.equal(matchesRequest(wrongContent,{invocation:{request}}),false);
 assert.throws(()=>assertPackedResourceCorrespondence(item,request,wrongContent));
 const wrongKind={...packed,kind:bad.kind};
 assert.notEqual(shared.admitRuntimeContract(schema,wrongKind).disposition,'admitted');
 const missingPath={...packed};delete missingPath.artifactPath;
 assert.notEqual(shared.admitRuntimeContract(schema,missingPath).disposition,'admitted');
 assert.throws(()=>assertPackedResourceCorrespondence(item,request,missingPath));
 results.push({label:i===0?'native26':'unchanged_consumer',packed,recordedRequestRef:projection.invocation.invocationRef,recordedRequestDigest:projection.invocation.requestDigest,positiveSchema:'admitted',positiveTuple:true,original167:{kind:bad.kind,productContent:bad.productContent,artifactPathPresent:Object.hasOwn(bad,'artifactPath'),schemaAdmitted:false,tupleMatches:false},isolatedNegatives:{wrongContentSchemaAdmitted:true,wrongContentTupleMatches:false,wrongKindSchemaAdmitted:false,missingPathSchemaAdmitted:false}});
}
const current=await readFile(join(root,'prepare.mjs'),'utf8');
assert(current.indexOf('recordedPackedResource(item,invocation.request)')<current.indexOf('a.acquireAbgEventResource('));
assert(current.indexOf('packed-resource-correspondence-complete')<current.indexOf('acquisition-start'));
assert(!current.includes("invoke('product-verify-'")&&!current.includes("invoke('product-resolve'")&&!current.includes("invoke('product-install26'"));
for(const name of ['binding-inputs.mjs','verify-artifacts.mjs'])assert.deepEqual(await readFile(join(root,name)),await readFile(join(root,'preimages',name)));
assert(current.includes("'/169/'")&&current.includes('/continuation-169'));
const result={kind:'selected_packed_resource_correspondence',status:'PASS',wallMs:performance.now()-start,results,owner:{path:ownerPath,sha256:hash(ownerBytes),byteCount:ownerBytes.length,schemaExcerptSha256:hash(schemaText),matcherExcerptSha256:hash(matcherText)},positivePremise:'Exact frozen164 native/consumer request and acquisition values; authentic origin is retained/pinned, not newly verified or admitted here.',schemaPremise:'Unchanged installed private schema/matcher bytes evaluated in memory with the installed Valibot and canonical schema leaves. This is pure contract instrumentation, not complete owner-operation execution or nominal authentication.',staticOrder:'Correspondence before acquisition; actual stage execution remains unproved.',unchangedHelpers:true,limits:'No archive verification, event/resource acquisition or read/hash, Public verification/resolution/install/bind, new nominal receipt/admission/currentness, stockheap large-history, native/model/app or UAT proof. Actual future execution must preserve live verified object identity and use genuine held-prefix owner projections.'};
await writeFile(join(root,'preflight-result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:result.status,wallMs:result.wallMs,positiveResources:results.length,original167Rejected:true,isolatedKindPathAndCoordinateNegatives:true,staticBeforeAcquire:true,noVerifierResourceOrTransport:true}));
