// File-only packet sufficiency using the already installed TypeScript parser.
// Literal module inputs only; this is not a Product dependency resolver.
import {readFile,stat} from 'node:fs/promises';
import {resolve,relative,dirname,extname,join,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules/typescript/lib/typescript.js');
const root=resolve(process.argv[2]),seeds=JSON.parse(await readFile(process.argv[3],'utf8'));
const selected=new Set(seeds),pending=[...seeds],visited=new Set(),added=[],missing=[],generated=new Set();
const tenant='build_tenants/abiogenesis/typescript';
const isGenerated=p=>['build','contracts','node_modules'].some(n=>p===`${tenant}/${n}`||p.startsWith(`${tenant}/${n}/`));
const exists=async p=>{try{return (await stat(p)).isFile();}catch(e){if(e.code==='ENOENT')return false;throw e;}};
while(pending.length){
 const rel=pending.pop();if(visited.has(rel)||!['.mjs','.cjs','.js','.ts','.mts','.cts'].includes(extname(rel)))continue;
 visited.add(rel);const file=join(root,rel);if(!await exists(file))continue;
 const source=ts.createSourceFile(file,await readFile(file,'utf8'),ts.ScriptTarget.Latest,true);
 const imports=[];
 const walk=node=>{
  if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))imports.push(node.moduleSpecifier.text);
  if(ts.isCallExpression(node)&&(node.expression.kind===ts.SyntaxKind.ImportKeyword||ts.isIdentifier(node.expression)&&node.expression.text==='require')&&node.arguments[0]&&ts.isStringLiteral(node.arguments[0]))imports.push(node.arguments[0].text);
  ts.forEachChild(node,walk);
 };walk(source);
 for(const spec of imports){
  if(!spec.startsWith('.'))continue;
  const target=resolve(dirname(file),spec),targetRel=relative(root,target).split(sep).join('/');
  if(targetRel==='..'||targetRel.startsWith('../')){missing.push({from:rel,spec,reason:'outside worksite'});continue;}
  if(isGenerated(targetRel)){generated.add(targetRel);continue;}
  const probes=[target,target.replace(/\.js$/,'.ts'),target.replace(/\.mjs$/,'.mts'),target.replace(/\.cjs$/,'.cts'),target+'.ts',target+'.mjs',join(target,'index.ts')];
  let found=null;for(const p of [...new Set(probes)])if(await exists(p)){found=relative(root,p).split(sep).join('/');break;}
  if(found===null){missing.push({from:rel,spec,reason:'no source file or declared generated module'});continue;}
  if(!selected.has(found)){selected.add(found);added.push({path:found,from:rel,spec});pending.push(found);}
 }
}
console.log(JSON.stringify({kind:'c2_literal_module_input_sufficiency',parserVersion:ts.version,selectedSeedCount:seeds.length,modulesRead:visited.size,added,missing,generatedImports:[...generated].sort(),limits:['Literal relative imports only; dynamic evidence paths and fixtures remain declared inputs and actual C2 obligations.','Build, contracts and node_modules imports are supplied by declared C2 producers, not canonical generated output.']}));
if(missing.length)process.exitCode=1;
