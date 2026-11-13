import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {gzipSync,gunzipSync} from 'node:zlib';
export const controlRoot=dirname(fileURLToPath(import.meta.url));
export const config=JSON.parse(await fs.readFile(join(controlRoot,'CONTROLS.json'),'utf8'));
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const json=async path=>JSON.parse(await fs.readFile(path,'utf8'));
export const save=async(path,value)=>fs.writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
export const load=async(root,name)=>import(pathToFileURL(join(root,'build/code/src',name+'.js')).href);
export async function pin(path){const b=await fs.readFile(path);return {path,bytes:b.length,sha256:sha(b)};}
export async function checkInputs(){
 for(const row of [...config.inputs,...config.controlFiles]){const actual=await pin(row.path);assert.equal(actual.bytes,row.bytes,row.path);assert.equal(actual.sha256,row.sha256,row.path);}
 const packageJson=await json(join(config.installedRoot,'package.json'));assert.equal(packageJson.version,'5.0.0-rc.10');
}
export function childEnvironment(runtimeTmp){
 const env={...process.env,TMPDIR:runtimeTmp,npm_config_offline:'true',npm_config_audit:'false',npm_config_fund:'false',npm_config_update_notifier:'false',npm_config_cache:join(runtimeTmp,'npm-cache'),
 ABI5_WAVE1_FROZEN_ARTIFACT_PATH:config.archive,ABI5_WAVE1_FROZEN_INSTALL_HOST:config.installHost,ABI5_WAVE1_FROZEN_ARTIFACT_SHA256:config.archiveSha256,
 ABG_TS_FP_TIMEOUT_MS:'60000',ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:'120000',ABG_TS_FP_TERMINATION_GRACE_MS:'1000'};
 for(const key of ['ABI5_SELECTED_ACTION_OWNER_SUBJECT','ABI5_SELECTED_ACTION_PUBLIC_START','ABI5_SELECTED_ACTION_FROZEN_FIXTURE_ENV','ABI5_SELECTED_ACTION_SOURCE_BOUND','ABG_TS_CLAUDE_APPEND_ARGS','ANTHROPIC_MODEL'])delete env[key];
 return env;
}
export async function snapshot(rawBytes,fixture,dest){
 await fs.mkdir(dest,{recursive:false});const zipped=gzipSync(rawBytes,{level:9});assert.deepEqual(gunzipSync(zipped),rawBytes);
 await fs.writeFile(join(dest,'events.jsonl.gz'),zipped,{flag:'wx'});
 const prefix={file:'events.jsonl.gz',bytes:rawBytes.length,sha256:sha(rawBytes),compressedBytes:zipped.length,compressedSha256:sha(zipped)};
 await save(join(dest,'fixture.json'),{kind:'t287_current_owner_evidence_fixture',schemaVersion:'1',producer:{version:'5.0.0-rc.10',sourceCommit:config.sourceCommit,sourceTree:config.sourceTree,builderPinSha256:config.builderPinSha256,archiveSha256:config.archiveSha256},prefix,...fixture});
 return {prefix,files:[await pin(join(dest,'events.jsonl.gz')),await pin(join(dest,'fixture.json'))]};
}
