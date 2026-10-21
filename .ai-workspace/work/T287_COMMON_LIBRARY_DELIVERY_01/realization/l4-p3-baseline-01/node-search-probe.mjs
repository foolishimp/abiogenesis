import {createRequire} from 'node:module';
import {lstat,readFile,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {isAbsolute,join,relative} from 'node:path';
const scratch='/private/tmp/abg-stdo3-l4-cb3836ff7660492d/baseline-p3/scratchParent/abi5-root-env-B6nZk9';
const targetRoot=join(scratch,'consumer-additional-0');
const fixtureRoot=join(targetRoot,'node_modules/@abi5-tests/language-fixtures');
const packageName='@abiogenesis/typescript-tenant';
const paths=createRequire(join(fixtureRoot,'package.json')).resolve.paths(packageName);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function inspect(path) {
  const relation=relative(targetRoot,path);
  const withinTarget=!isAbsolute(relation)&&relation!=='..'&&!relation.startsWith('../');
  try {
    const stat=await lstat(path), actual={path,present:true,withinTarget,nodeKind:stat.isSymbolicLink()?'symlink':stat.isDirectory()?'directory':'file',realpath:await realpath(path)};
    if(stat.isDirectory())for(const name of ['package.json','product-toolchain-manifest.json']){
      try{const bytes=await readFile(join(path,name)),value=JSON.parse(bytes);actual[name]={sha256:hash(bytes),bytes:bytes.length,name:value.name,version:value.version,productId:value.productId,productContentDigest:value.productContentDigest};}
      catch(error){actual[name]={errorCode:error.code??null,message:error.message};}
    }
    return actual;
  }catch(error){if(error.code!=='ENOENT')throw error;return {path,present:false,withinTarget,errorCode:error.code};}
}
const candidates=[];
for(const path of paths??[])candidates.push(await inspect(join(path,...packageName.split('/'))));
console.log(JSON.stringify({kind:'read_only_node_dependency_search_observation',scope:'Node search paths and physical presence only; no Product import/admission/repair/retry',targetRoot,fixtureRoot,packageName,searchPaths:paths,candidates,siblingAbi:await inspect(join(scratch,'consumer/node_modules',...packageName.split('/')))},null,2));
