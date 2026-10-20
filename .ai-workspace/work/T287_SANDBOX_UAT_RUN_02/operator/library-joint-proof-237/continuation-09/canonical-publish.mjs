// Attempt07 copies the existing publication steps, selecting the already-built
// canonical candidate. It performs no build, generator, or metadata repair.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const root=dirname(fileURLToPath(import.meta.url));
const selected=JSON.parse(await readFile(resolve(process.argv[2]),'utf8'));
assert.equal(process.env.NODE_OPTIONS,undefined);assert.equal(process.env.NODE_PATH,undefined);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const pin of [...selected.acceptedSubjects,...selected.helperFiles,...selected.fixtureFiles]) {
  const bytes=await readFile(pin.path);assert.equal(bytes.length,pin.byteCount,pin.path);assert.equal(sha(bytes),pin.sha256,pin.path);
}
const expected=JSON.parse(await readFile(join(root,'preflight.json'),'utf8'));
const canonical=resolve(selected.canonicalRoot);
const {commandRecorder}=await import(pathToFileURL(join(selected.helperRoot,'runner.mjs')).href);
const output=join(root,'publication');await mkdir(output);await mkdir(join(output,'packs'));
const record=async(name,value)=>writeFile(join(output,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const command=commandRecorder(output,{environment:{...process.env,npm_config_cache:join(output,'npm-cache'),npm_config_offline:'true'},timeoutMs:300000,maxOutputBytes:4194304});
const success=result=>{assert.equal(result.exitCode,0);assert.equal(result.signal,null);assert(!result.timedOut&&!result.truncated&&!result.failure);};
let current='canonical-pack';
try {
  const packed=await command('pack',selected.npm,['pack','--ignore-scripts','--json','--pack-destination',join(output,'packs')],{cwd:canonical});success(packed);
  const [{filename}]=JSON.parse(packed.stdout),archivePath=join(output,'packs',filename),bytes=await readFile(archivePath);
  const manifest=JSON.parse(await readFile(join(canonical,'product-toolchain-manifest.json'),'utf8'));
  assert.equal(manifest.productContentDigest,selected.expectedProductContentDigest);
  assert.equal(sha(await readFile(selected.canonicalManifest.path)),selected.canonicalManifest.sha256);
  const identity={archivePath,artifactDigest:'sha256:'+sha(bytes),byteCount:bytes.length,productId:manifest.productId,packageName:manifest.packageName,packageVersion:manifest.packageVersion,productContentDigest:manifest.productContentDigest};
  await record('archive.json',identity);
  current='archive-correspondence';
  // This standard tar inventory is comparison evidence, never runtime authority.
  const archiveCheck=String.raw`
from pathlib import Path
import json,hashlib,tarfile,sys
expected=json.loads(Path(sys.argv[1]).read_text());archive=Path(sys.argv[2]);target=Path(sys.argv[3])
members={row['relativePath']:row for row in expected['payloadFiles']}
for row in expected['mandatoryFiles']:
    relative=str(Path(row['path']).relative_to(Path(expected['canonicalManifest']['path']).parent));members[relative]={**row,'mode':420,'type':'file'}
actual={}
with tarfile.open(archive,'r:gz') as tf:
    for member in tf.getmembers():
        assert member.name.startswith('package/') and member.isfile(),member.name
        path=member.name[len('package/'):];assert path not in actual,path
        body=tf.extractfile(member).read();actual[path]={'path':path,'type':'file','mode':member.mode,'byteCount':len(body),'sha256':hashlib.sha256(body).hexdigest()}
assert set(actual)==set(members),{'missing':sorted(set(members)-set(actual)),'extra':sorted(set(actual)-set(members))}
differences=[]
for path,row in actual.items():
    basis=members[path];assert row['byteCount']==basis['byteCount'] and row['sha256']==basis['sha256'],path
    if row['mode']!=basis['mode']:
        assert path in ['build/code/src/public/cli.js','build/code/src/public/codex_cli.js'] and basis['mode']==420 and row['mode']==493,path
        differences.append({'path':path,'canonicalMode':basis['mode'],'archiveMode':row['mode']})
with target.open('x') as h:json.dump({'memberCount':len(actual),'exactMembershipAndBodies':True,'modeDifferences':differences,'members':[actual[path] for path in sorted(actual)]},h,indent=2);h.write('\n')
`;
  await promisify(execFile)('python3',['-c',archiveCheck,join(root,'preflight.json'),archivePath,join(output,'archive-correspondence.json')],{maxBuffer:1048576});
  current='clean-offline-host';const host=join(output,'host'),installedRoot=join(host,'node_modules/@abiogenesis/typescript-tenant');
  const installed=await command('install-host',selected.npm,['install','--ignore-scripts','--offline','--no-audit','--no-fund','--prefix',host,archivePath],{cwd:output});success(installed);
  await record('host-selector.json',{installedRoot,...identity,manifestPath:join(installedRoot,'product-toolchain-manifest.json')});
  current='installed-correspondence';
  const installedCheck=String.raw`
from pathlib import Path
import json,hashlib,stat,sys
archive=json.loads(Path(sys.argv[1]).read_text());root=Path(sys.argv[2]);actual={}
for path in root.rglob('*'):
    if path.is_dir() and not path.is_symlink():continue
    node=path.lstat();assert stat.S_ISREG(node.st_mode) and not path.is_symlink(),str(path)
    relative=path.relative_to(root).as_posix();body=path.read_bytes();actual[relative]={'path':relative,'mode':stat.S_IMODE(node.st_mode),'byteCount':len(body),'sha256':hashlib.sha256(body).hexdigest()}
expected={row['path']:row for row in archive['members']};assert set(actual)==set(expected)
differences=[]
for path,row in actual.items():
    basis=expected[path];assert row['byteCount']==basis['byteCount'] and row['sha256']==basis['sha256'],path
    if row['mode']!=basis['mode']:
        assert path in ['build/code/src/public/cli.js','build/code/src/public/codex_cli.js'] and basis['mode']==420 and row['mode']==493,path
        differences.append({'path':path,'archiveMode':basis['mode'],'installedMode':row['mode']})
with Path(sys.argv[3]).open('x') as h:json.dump({'memberCount':len(actual),'exactArchiveMembershipAndBodies':True,'modeDifferences':differences,'actualInstalledModes':{path:row['mode'] for path,row in sorted(actual.items())}},h,indent=2);h.write('\n')
`;
  await promisify(execFile)('python3',['-c',installedCheck,join(output,'archive-correspondence.json'),installedRoot,join(output,'installed-correspondence.json')],{maxBuffer:1048576});
  current='source-blind-typescript-consumer';
  const consumerPath=join(host,'consumer.mts');await writeFile(consumerPath,await readFile(join(root,'consumer.mts')),{flag:'wx'});
  const compiler=createRequire(import.meta.url)(join(installedRoot,'build/toolchain/typescript.cjs')),ts=compiler.default??compiler;
  const options={module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,noEmit:true,skipLibCheck:false,strict:true,target:ts.ScriptTarget.ES2022};
  const toolchainRoot=dirname(ts.getDefaultLibFilePath(options));
  const program=ts.createProgram([consumerPath],{...options,typeRoots:[join(toolchainRoot,'node_modules/@types')],types:['node']});
  const diagnostics=ts.getPreEmitDiagnostics(program).map(row=>({code:row.code,path:row.file?.fileName??null,start:row.start??null,message:ts.flattenDiagnosticMessageText(row.messageText,'\n')}));
  await record('typescript-consumer.json',{compilerVersion:ts.version,consumerPath,diagnostics,sourceBlind:true});assert.equal(diagnostics.length,0);
  await record('publication-result.json',{generationPerformed:false,packMs:packed.wallMs,installMs:installed.wallMs,...identity,installedRoot,claim:'Direct exact canonical package/archive/installed correspondence; native composition follows separately in this grant'});
} catch(error) {
  await record('first-cause.json',{stage:current,name:error.name,message:error.message,stack:error.stack,disposition:'STOP; preserve completed effects for Root RCA/action before retry'});
  throw error;
}
