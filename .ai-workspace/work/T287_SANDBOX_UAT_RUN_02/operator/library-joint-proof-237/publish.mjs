// Prepared only. Root must select the exact accepted joint successor before use.
// This is the ordinary236 generator/pack/offline-install driver, not a publisher API.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

const root=dirname(fileURLToPath(import.meta.url));
assert(process.argv[2],'An exact Root-selected successor input is required; cut11 is excluded');
const selected=JSON.parse(await readFile(resolve(process.argv[2]),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const pin of [...selected.acceptedSubjects,...selected.stageFiles,...selected.helperFiles]) {
  const bytes=await readFile(pin.path);
  assert.equal(bytes.length,pin.byteCount,pin.path);
  assert.equal(sha(bytes),pin.sha256,pin.path);
  assert.notEqual(pin.sha256,'a8a010a3e620f74a723f3f23aab2d484de09dea70c6789e04ed4e1969546e8b5','Rejected cut11 cannot seed publication');
}
const stage=resolve(selected.stageRoot);
assert(stage.startsWith(root+'/'),'Publication uses237 isolated staging only');
assert(selected.stageFiles.some(pin=>pin.path===join(stage,'package.json')));
assert(selected.stageFiles.some(pin=>pin.path===join(stage,'scripts/generate-product-manifest.mjs')));
assert(selected.helperFiles.some(pin=>pin.path===join(selected.helperRoot,'runner.mjs')));
const {commandRecorder}=await import(pathToFileURL(join(selected.helperRoot,'runner.mjs')).href);
const output=join(root,'publication');await mkdir(output);
const record=async(name,value)=>writeFile(join(output,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const command=commandRecorder(output,{environment:{...process.env,npm_config_cache:join(output,'npm-cache'),npm_config_offline:'true'},timeoutMs:300000,maxOutputBytes:4194304});
const success=result=>{assert.equal(result.exitCode,0);assert.equal(result.signal,null);assert(!result.timedOut&&!result.truncated&&!result.failure);};
let current='generate';
try {
  const generated=await command('generate',process.execPath,['scripts/generate-product-manifest.mjs'],{cwd:stage});success(generated);
  current='pack';await mkdir(join(output,'packs'));
  const packed=await command('pack',selected.npm,['pack','--ignore-scripts','--json','--pack-destination',join(output,'packs')],{cwd:stage});success(packed);
  const [{filename}]=JSON.parse(packed.stdout),archivePath=join(output,'packs',filename),bytes=await readFile(archivePath);
  const manifest=JSON.parse(await readFile(join(stage,'product-toolchain-manifest.json'),'utf8'));
  const identity={archivePath,artifactDigest:'sha256:'+sha(bytes),byteCount:bytes.length,productId:manifest.productId,packageName:manifest.packageName,packageVersion:manifest.packageVersion,productContentDigest:manifest.productContentDigest};
  await record('archive.json',identity);
  current='clean-offline-host';const host=join(output,'host'),installedRoot=join(host,'node_modules/@abiogenesis/typescript-tenant');
  const installed=await command('install-host',selected.npm,['install','--ignore-scripts','--offline','--no-audit','--no-fund','--prefix',host,archivePath],{cwd:output});success(installed);
  await record('host-selector.json',{installedRoot,...identity,manifestPath:join(installedRoot,'product-toolchain-manifest.json')});
  current='source-blind-typescript-consumer';
  const consumerPath=join(host,'consumer.mts');
  await writeFile(consumerPath,await readFile(join(root,'consumer.mts')),{flag:'wx'});
  const compiler=createRequire(import.meta.url)(join(installedRoot,'build/toolchain/typescript.cjs'));
  const ts=compiler.default??compiler;
  const options={module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,noEmit:true,skipLibCheck:false,strict:true,target:ts.ScriptTarget.ES2022};
  const toolchainRoot=dirname(ts.getDefaultLibFilePath(options));
  const program=ts.createProgram([consumerPath],{...options,typeRoots:[join(toolchainRoot,'node_modules/@types')],types:['node']});
  const diagnostics=ts.getPreEmitDiagnostics(program).map(row=>({code:row.code,path:row.file?.fileName??null,start:row.start??null,message:ts.flattenDiagnosticMessageText(row.messageText,'\n')}));
  await record('typescript-consumer.json',{compilerVersion:ts.version,consumerPath,diagnostics,sourceBlind:true});
  assert.equal(diagnostics.length,0,'Actual installed public declarations must support the external TypeScript consumer');
  await record('publication-result.json',{generationMs:generated.wallMs,packMs:packed.wallMs,installMs:installed.wallMs,...identity,installedRoot,claim:'Ordinary publication/host only; live canonical verification and native composition follow separately'});
} catch(error) {
  await record('first-cause.json',{stage:current,name:error.name,message:error.message,stack:error.stack,disposition:'STOP; retain completed effects, Root RCA/action before retry'});
  throw error;
}
