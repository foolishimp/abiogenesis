// Root's finite C2 proof recipe; Product owners build, verify and execute the candidate.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const repo=process.cwd(),tenant=join(repo,'build_tenants/abiogenesis/typescript'),input=join(repo,'rc5-operator-inputs/f4-01');
const json=async p=>JSON.parse(await readFile(p,'utf8')),hash=b=>createHash('sha256').update(b).digest('hex');
const retained=await json(join(input,'METHOD_RETAINED_PROOF.json'));
const helperBytes=await readFile(join(input,'retained-method-c2-result.json'));
assert.equal(hash(helperBytes),retained.helperSha256);
const helper=JSON.parse(helperBytes);assert.equal(helper.artifactDigest,retained.helperArtifactDigest);
assert.equal(helper.commandResults.length,6);assert(helper.commandResults.every(r=>r.exitStatus===0&&!r.timedOut&&r.processSignal===null));
assert(helper.predicateObservations.every(p=>p.observedValue===0));
for(const row of retained.unchangedSourceFiles)assert.equal(hash(await readFile(join(repo,row.path))),row.sha256,row.path);
for(const row of retained.qualificationFiles)assert.equal(hash(await readFile(join(tenant,row.path))),row.sha256,row.path);
const source=await import(pathToFileURL(join(tenant,'build/code/src/gtl/default_library.js')));
assert.equal(source.DEFAULT_LIBRARY_STDO_SOURCE.basisRef,'stdo://releases/v3.0.4/');
assert.equal(source.DEFAULT_LIBRARY_STDO_SOURCE.manifestDigest,'sha256:102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b');
for(const member of [source.DEFAULT_LIBRARY_STDO_SOURCE.manifest,...Object.values(source.DEFAULT_LIBRARY_STDO_SOURCE.members)]){
 const b=await readFile(join(tenant,member.assetPath));assert.equal(b.length,member.byteCount);
 assert.equal('sha256:'+hash(b),member.digest??source.DEFAULT_LIBRARY_STDO_SOURCE.manifestDigest);
}
// Identity changes are limited to the two Product constants and package/lock root versions.
const pkg=await json(join(tenant,'package.json')),lock=await json(join(tenant,'package-lock.json'));
const oldPkg=await json(join(input,'identity-preimages/package.json')),oldLock=await json(join(input,'identity-preimages/package-lock.json'));
assert.equal(pkg.version,'5.0.0-rc.5');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert.deepEqual({...pkg,version:oldPkg.version},oldPkg);
assert.deepEqual({...lock,version:oldLock.version,packages:{...lock.packages,'':{...lock.packages[''],version:oldLock.packages[''].version}}},oldLock);
const contracts=await readFile(join(tenant,'code/src/product/contracts.ts'),'utf8');
assert.equal(contracts.replaceAll('5.0.0-rc.5','5.0.0-rc.4'),await readFile(join(input,'identity-preimages/contracts.ts'),'utf8'));
const product=await import(pathToFileURL(join(tenant,'build/code/src/product/index.js')));
assert.equal(product.ABI5_PACKAGE_VERSION,pkg.version);
assert.equal(product.ABI5_PRODUCT_ID,'product://abiogenesis/typescript-tenant@5.0.0-rc.5');
const manifest=await json(join(tenant,'product-toolchain-manifest.json'));
assert.equal(manifest.packageVersion,pkg.version);assert.equal(manifest.productId,product.ABI5_PRODUCT_ID);
const archive=join(tenant,'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.5.tgz'),artifactDigest='sha256:'+hash(await readFile(archive));
const verified=await product.verifyProduct({artifactPath:archive,artifactRef:pathToFileURL(archive).href,
 expectedArtifactDigest:artifactDigest,expectedManifestDigest:product.sha256Canonical(manifest),
 expectedProductContentDigest:manifest.productContentDigest,expectedProductId:product.ABI5_PRODUCT_ID,
 expectedPackageName:pkg.name,expectedPackageVersion:pkg.version});
assert.equal(verified.disposition,'verified',JSON.stringify(verified));
await writeFile(join(tenant,'artifacts/rc5-verification.json'),JSON.stringify(verified)+'\n');

const runs=[];
function tests(label,files,pattern){
 const args=['--experimental-vm-modules','--test','--test-reporter=tap','--test-concurrency=1',...(pattern?['--test-name-pattern='+pattern]:[]),...files];
 const env={...process.env,ABG_RC5_ROUTE_SAMPLE_FILE:join(input,'CAPTURED_ROUTE_SAMPLE.json')};
 const began=performance.now(),r=spawnSync(process.execPath,args,{cwd:tenant,env,encoding:'utf8',maxBuffer:64*1024*1024});
 if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);
 assert.equal(r.signal,null,label);assert.equal(r.status,0,label);
 const count=key=>Number(r.stdout.match(new RegExp('^# '+key+' (\\d+)$','m'))?.[1]??NaN);
 const row={label,args,wallMs:performance.now()-began,pass:count('pass'),fail:count('fail'),skipped:count('skipped'),stdoutSha256:hash(r.stdout),stderrSha256:hash(r.stderr)};
 assert(row.pass>0&&row.fail===0,label);runs.push(row);return r.stdout;
}
const planning=tests('method-selector-planning',['test_env/tests/t287-default-library.test.mjs'],
 '^selector planning preserves provenance, adverse values and bounded Unicode diagnostic ranges$');
assert.equal(runs.at(-1).pass,1);assert.equal(runs.at(-1).skipped,0);
const codec=tests('retained-route-codec',['test_env/tests/t287-event-body-encoding.test.mjs']);
assert.match(codec,/^ok \d+ - RC5 retained route/m,'new F4 component cases must execute');
const measures=codec.split('\n').filter(l=>l.startsWith('# RC5_RETAINED_ROUTE_MEASURE ')).map(l=>JSON.parse(l.slice('# RC5_RETAINED_ROUTE_MEASURE '.length)));
const captured=measures.find(m=>m.sample==='captured-route-37961');assert(captured,'captured physical-row measurement required');
assert.equal(captured.logicalUnchanged,true);assert(captured.beforeBytes>captured.afterBytes);
assert.equal(captured.netSavedBytes,captured.beforeBytes-captured.afterBytes);
tests('route-reconstruction',['test_env/tests/t287-route-reconstruction.test.mjs']);
const installed=tests('installed-retained-route',['test_env/tests/m5-installed-graph-edge.test.mjs']);
assert.match(installed,/^ok \d+ - RC5 retained route/m,'new installed F4 sunny path must execute');
assert.equal(runs.at(-1).skipped,0);
// Tests cannot silently change the selected artifact, source law or staged method inputs.
assert.equal('sha256:'+hash(await readFile(archive)),artifactDigest);
for(const row of retained.unchangedSourceFiles)assert.equal(hash(await readFile(join(repo,row.path))),row.sha256,row.path);
for(const row of retained.qualificationFiles)assert.equal(hash(await readFile(join(tenant,row.path))),row.sha256,row.path);
const exclusions=await json(join(input,'PROOF_EXCLUSIONS.json'));
const report={kind:'rc5_f4_and_method_gap_candidate_proof',packageVersion:pkg.version,artifactDigest,
 manifestDigest:product.sha256Canonical(manifest),productContentDigest:manifest.productContentDigest,
 method:{basis:source.DEFAULT_LIBRARY_STDO_SOURCE.basisRef,manifestDigest:source.DEFAULT_LIBRARY_STDO_SOURCE.manifestDigest},
 inheritedMethodEvidence:{c2ResultRef:retained.c2ResultRef,helperArtifactDigest:retained.helperArtifactDigest,
  sourceCommit:retained.sourceCommit,selectedPass:18,selectedFail:0,selectedSkip:0,
  unchangedSourceFiles:retained.unchangedSourceFiles,qualificationFilesUnchanged:retained.qualificationFiles.length,
  scope:'Exact method declaration/generator/HOW/tests and qualification inputs; prior native UAT indeterminate retained. No prior completed verdict substituted.'},
 runs,capturedRouteMeasurement:captured,otherMeasurements:measures.filter(m=>m!==captured),exclusions,
 qualification:false,limits:['Selected affected proof only; no full Product/GC03/native capacity qualification.',
 'Captured sample is three exact historical physical rows, not a standalone admitted history or whole-campaign/latency saving.',
 'Actual native UAT and final result/replay follow through ABG; local cut/install follow Root conjunction.']};
await mkdir(join(tenant,'artifacts'),{recursive:true});
await writeFile(join(tenant,'artifacts/rc5-final-proof.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
