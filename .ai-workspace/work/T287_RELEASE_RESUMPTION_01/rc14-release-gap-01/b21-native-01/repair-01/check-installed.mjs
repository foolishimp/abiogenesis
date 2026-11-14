// Bounded installed binary + physical-owner check. Cold fixture coordinates
// deliberately make no Public admission, native execution or release claim.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readdir,readFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const [tenantArg,installedArg]=process.argv.slice(2);
assert(tenantArg&&installedArg&&process.argv.length===4);
const tenant=resolve(tenantArg), installed=resolve(installedArg);
process.env.ABG_WORKSITE_BUILD_ROOT=join(installed,'build/code/src');
const {loadWorksiteOwner,worksiteFixture}=await import(pathToFileURL(join(tenant,'test_env/support/t287-generic-job-worksite.mjs')));
const product=await loadWorksiteOwner(), require=createRequire(import.meta.url);
const binaryNames=(await readdir(join(installed,'build/native'))).filter(n=>n.endsWith('.node'));
assert(binaryNames.length>0,'installed native binary required');
const binaries=[];
for(const name of binaryNames){
  const file=join(installed,'build/native',name), data=await readFile(file);
  const loaded=require(file); assert(loaded!==null&&['object','function'].includes(typeof loaded));
  binaries.push({name,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),loaded:true});
}
const env=await worksiteFixture(product);
try{
  const input={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,writeRoots:['safe-new/child']};
  const lawful=await product.checkWorksiteWriteRoots(input);
  assert.equal(lawful,null,JSON.stringify(lawful));
  const bridge=await product.checkWorksiteWriteRoots({...input,protectedInstallRoots:['/System/Volumes/Data']});
  assert.equal(bridge?.kind,'worksite_effect_refusal',JSON.stringify(bridge));
  assert.equal(bridge.code,'subject_outside_territory','actual observed Data overlap, not a generic unavailable-addon refusal');
  assert.deepEqual(await readdir(env.canonicalRoot),[],'read-only physical preflights caused no target effects');
  console.log(JSON.stringify({kind:'installed_native_physical_owner_proof',installed,binaries,lawfulSibling:lawful,protectedData:bridge,
    noTargetEffects:true,componentCoordinates:true,publicAdmissionClaim:false,node:process.version,platform:process.platform,arch:process.arch,qualified:false}));
}finally{await rm(env.scratch,{recursive:true,force:true});}
