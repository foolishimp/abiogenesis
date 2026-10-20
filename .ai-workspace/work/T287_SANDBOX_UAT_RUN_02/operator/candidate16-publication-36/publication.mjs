import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,lstat} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const repo='/Users/jim/src/apps/abiogenesis',tenant=repo+'/build_tenants/abiogenesis/typescript',work=repo+'/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const phase=work+'/operator/candidate16-publication-36',candidate=work+'/candidate-16',source=work+'/operator/event-memory-repair-35';
const pin=async path=>{const status=await lstat(path);assert(status.isFile()&&!status.isSymbolicLink(),path);const bytes=await readFile(path);return {path,sha256:createHash('sha256').update(bytes).digest('hex'),byteCount:bytes.length};};
const fixed=[
  [repo+'/stdo_abiogenesis.json','eafbb85e640bd007b1e5b94bdc13ab4eb470c8dedaa3ae1a3b586687daf6869c',4277],
  [source+'/return.md','8b3fbcb744fdec2a4ea3dd4d414997b998e996189ffc810f12633b2ab2053753',2956],
  [source+'/readiness.json','66d6e0e70bd4b39af6dd17ccb69b98baa52f69295839bcb02db695dc103dbe2d',37218],
  [source+'/freeze.json','bd671ad49267e494eeeb649deab8a2aeb8c9e014a4ef12e4349d174486c59dc1',272159],
  [work+'/candidate-15/identity.json','ff215ba791996ec5ba1d34220de881a2c3db9db961719a4d11a105633491a6c9',6512],
  [work+'/candidate-15/freeze.json','fe38075c3acdf6b9dc3cc8ea6c6b5a809c3aa5b6b8e33b1d5a6b979299de1015',10359],
  [work+'/candidate-15/packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz','1fe497924a215c4215865c36e50230ebf96e81aefc1ba81705ee59150065267d',10623282]
].map(([path,sha256,byteCount])=>({path,sha256,byteCount}));
const ready=JSON.parse(await readFile(source+'/readiness.json','utf8')),freeze=JSON.parse(await readFile(source+'/freeze.json','utf8'));
const generated=freeze.ledger.filter(row=>row.path.startsWith(tenant+'/build/')||row.path.startsWith(tenant+'/contracts/')||row.path===tenant+'/product-toolchain-manifest.json');
const selected=[...fixed,...ready.sourceDelta.map(v=>v.postimage),...generated];
assert.equal(selected.length,947);
for(const expected of selected)assert.deepEqual(await pin(expected.path),expected);
await mkdir(candidate);await mkdir(candidate+'/packs');
await writeFile(phase+'/activation.json',JSON.stringify({role:'Writer36 Candidate Publication',rootClosedSource35GO:true,rootClosedProof35GO:true,method:'STDO2.5.1-rc.2 manifest3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782',ProductFrame:'fixed15 ABI5 5.0 GOAL035/T287; immutable installed Product publication',frames:['repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-worksite-causality','repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration'],ownerRoutes:['specification/PRODUCT.md#installed-product-and-catalog','T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md current35 RC2 increment','accepted Writer32 packaged publication procedure'],fixedPins:fixed,sourcePins:ready.sourceDelta.map(v=>v.postimage),generatedPinsReuse:{freeze:fixed[3],count:generated.length,freshlyVerified:true},effectTerritory:[candidate,phase],path:'accepted35 frozen generated outputs -> one npm pack --ignore-scripts -> exact8 member comparison -> extracted packaged canonical verifyProduct -> frozen identity',nativeCredit:false,retainedDisposition:'17/18 bounded readiness; t288line59 unchanged historical expectation outside trusted-desktop claims; authentic memory lane bounded; prior8 detections/8 restores and Accounting active/unexecuted retained only on oldRun'},null,2)+'\n',{flag:'wx'});
const {commandRecorder}=await import(pathToFileURL(tenant+'/test_env/uat/runner.mjs').href);
const command=commandRecorder(candidate,{environment:{...process.env,npm_config_cache:candidate+'/scratch/npm-cache'},timeoutMs:300000,maxOutputBytes:1048576});
const requireSuccess=result=>{assert.equal(result.exitCode,0);assert.equal(result.signal,null);assert(!result.timedOut&&!result.truncated&&!result.failure);};
const pack=await command('pack','/opt/homebrew/bin/npm',['pack','--ignore-scripts','--json','--pack-destination',candidate+'/packs'],{cwd:tenant});requireSuccess(pack);
const archive=await pin(candidate+'/packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz');
await writeFile(candidate+'/archive.json',JSON.stringify({archive,pack:{exitCode:pack.exitCode,wallMs:pack.wallMs,timedOut:pack.timedOut,truncated:pack.truncated},sourceFreeze:fixed[3],sourceCommit:'0b1187c40cca619b26b56b24b72cf8beb4841310',noBuildOrNative:true},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({phase:'packed',archive,wallMs:pack.wallMs}));
const comparison=await command('member-comparison','/usr/bin/python3',[phase+'/member-comparison.py'],{cwd:tenant});requireSuccess(comparison);
await mkdir(candidate+'/scratch/successor',{recursive:true});
const extract=await command('extract','/usr/bin/tar',['-xzf',archive.path,'-C',candidate+'/scratch/successor'],{cwd:tenant});requireSuccess(extract);
const owner=await command('packaged-owner','/opt/homebrew/bin/node',[phase+'/packaged-owner.mjs'],{cwd:tenant});requireSuccess(owner);
console.log(JSON.stringify({phase:'owner-verified',commandWallMs:owner.wallMs,owner:JSON.parse(await readFile(candidate+'/owner-verification.json','utf8')).projection}));
for(const expected of selected)assert.deepEqual(await pin(expected.path),expected);
await writeFile(phase+'/mechanical-result.json',JSON.stringify({archive,all947SelectedPinsStillExact:true,sourcePins:ready.sourceDelta.map(v=>v.postimage),generatedDelta:ready.generatedDelta,commandScalars:[['pack',pack],['member-comparison',comparison],['extract',extract],['packaged-owner',owner]].map(([label,value])=>({label,exitCode:value.exitCode,wallMs:value.wallMs,timedOut:value.timedOut,truncated:value.truncated,failure:value.failure})),noBuildOrInstallOrNative:true},null,2)+'\n',{flag:'wx'});
