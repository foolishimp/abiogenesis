import { readFile, writeFile, mkdir, readdir, symlink, copyFile } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { createHash } from 'node:crypto';
import ts from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript/lib/typescript.js';
const home = new URL('.',import.meta.url).pathname;
const phase = dirname(home.slice(0,-1));
const cut = join(phase,'dependency-cut-11');
const selected = JSON.parse(await readFile(join(cut,'inputs.json'),'utf8'));
const frozenConfig = JSON.parse(await readFile(join(phase,'tsconfig.json'),'utf8'));
const stage = join(home,'source');
await mkdir(stage,{recursive:true});
const metadata = await readFile(join(phase,'source/package.json'));
await writeFile(join(home,'package.json'),metadata,{flag:'wx'});
await symlink('/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules',join(home,'node_modules'));
const roots=[];
for (const row of selected.sourceInputs) {
  const bytes=await readFile(row.path);
  if (bytes.length!==row.bytes || createHash('sha256').update(bytes).digest('hex')!==row.sha256) throw new Error('frozen source changed '+row.path);
  const target=join(stage,relative(cut,row.path));
  await mkdir(dirname(target),{recursive:true}); await writeFile(target,bytes,{flag:'wx'}); roots.push(target);
}
const output=join(home,'emitted');
const raw={...frozenConfig.compilerOptions,rootDir:join(stage,'code/src'),outDir:output,skipLibCheck:false};
const converted=ts.convertCompilerOptionsFromJson(raw,home);
const diagnostics = d=>d.map(x=>({code:x.code,category:ts.DiagnosticCategory[x.category],file:x.file?.fileName,start:x.start,message:ts.flattenDiagnosticMessageText(x.messageText,'\n')}));
if(converted.errors.length)throw new Error(JSON.stringify(diagnostics(converted.errors)));
await writeFile(join(home,'effective-config.json'),JSON.stringify({options:raw,files:roots},null,2)+'\n',{flag:'wx'});
const started=performance.now();
let program=ts.createProgram({rootNames:roots,options:converted.options});
const sourceDiagnostics=ts.getPreEmitDiagnostics(program);
let emitted={emitSkipped:true,diagnostics:[]};
if(sourceDiagnostics.length===0)emitted=program.emit();
let declarationFiles=[];let declarationDiagnostics=[];
if(sourceDiagnostics.length===0&&!emitted.emitSkipped&&emitted.diagnostics.length===0){
  async function collect(path){for(const item of await readdir(path,{withFileTypes:true})){
    const selected=join(path,item.name);if(item.isDirectory())await collect(selected);else if(item.name.endsWith('.d.ts'))declarationFiles.push(selected);
  }}
  await collect(output);
  const options={...converted.options,rootDir:output,noEmit:true,declaration:false,stripInternal:false,skipLibCheck:false};
  delete options.outDir;
  program=ts.createProgram({rootNames:declarationFiles,options});
  declarationDiagnostics=ts.getPreEmitDiagnostics(program);
}
const result={kind:'frozen_cut_stripped_declaration_check',sourceCount:roots.length,declarationCount:declarationFiles.length,skipLibCheck:false,stripInternal:true,elapsedMs:performance.now()-started,sourceDiagnostics:diagnostics(sourceDiagnostics),emissionDiagnostics:diagnostics(emitted.diagnostics),emitSkipped:emitted.emitSkipped,declarationDiagnostics:diagnostics(declarationDiagnostics),limits:['TypeScript declaration linkage only; not canonical packed publication closure or runtime acceptance','Unfinished replay and consumer retention excluded']};
await writeFile(join(home,'declaration-result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result));
process.exitCode=(sourceDiagnostics.length||emitted.emitSkipped||emitted.diagnostics.length||declarationDiagnostics.length)?1:0;
