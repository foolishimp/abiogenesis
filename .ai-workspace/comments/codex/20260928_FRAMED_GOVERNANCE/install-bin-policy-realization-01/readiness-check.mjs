import assert from 'node:assert/strict';
import {readFile,writeFile,lstat,mkdir,symlink,unlink} from 'node:fs/promises';
import {join,resolve,isAbsolute,relative} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {loadPackageExport} from './public-support.mjs';
const here=resolve(fileURLToPath(new URL('.',import.meta.url))),read=async p=>JSON.parse(await readFile(p,'utf8'));
const write=(n,v)=>writeFile(join(here,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const schemaVersion='5.0.0',startedAt=new Date().toISOString(),start=performance.now();
const hashBytes=b=>createHash('sha256').update(b).digest('hex');
let phase='source_built_nominal_verification',mutatedPath=null;
try{
 const selected=await read(join(here,'selected.json'));
 const product=await loadPackageExport(selected.readinessPackageRoot,'@abiogenesis/typescript-tenant','./product');
 assert.equal(process.env.npm_config_bin_links,'true');
 const verificationRequest=item=>({artifactPath:item.artifactPath,artifactRef:item.artifactRef,...Object.fromEntries(['ArtifactDigest','ProductContentDigest','ManifestDigest','ProductId','PackageName','PackageVersion'].map(k=>['expected'+k,item.basis[k[0].toLowerCase()+k.slice(1)]]))});
 const items=[{name:'core',...selected.core},{name:'fixture',...selected.fixture}];
 for(const item of items){
  const packet={kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',request:verificationRequest(item)};
  item.verification=await product.ProductVerificationPort.verify(packet);assert.equal(item.verification.kind,'product_verification_success',JSON.stringify(item.verification));item.verified=item.verification.verifiedArtifact;assert.strictEqual(product.selectOwnedProductVerification(packet.request,item.verified),item.verified);await write('nominal-'+item.name+'.json',item.verification);
 }
 const lock=product.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion,memberKey:'resolve',verifiedArtifacts:items.map(i=>i.verified)});assert.equal(lock.kind,'resolved_product_lock',JSON.stringify(lock));assert.equal(lock.rows.length,2);await write('actual-nominal-mixed-lock.json',lock);
 await write('readiness-nominal-completion.json',{status:'passed',completedAt:new Date().toISOString(),elapsedMs:performance.now()-start,lockId:lock.lockId,products:items.map(i=>({productId:i.verified.productId,productContentDigest:i.verified.productContentDigest}))});
 phase='actual_published_installer_port';const item=items[1],targetRoot=join(here,'test-installs/fixture');
 const packet={kind:'product_install_packet',schemaVersion,memberKey:'install',request:{artifactPath:item.artifactPath,verifiedArtifact:item.verified,resolvedLock:lock,targetRoot}};
 await write('positive-install-packet.json',packet);
 const installStart=performance.now(),installed=await product.ProductInstallPort.install(packet);
 await write('positive-install-outcome.json',{outcome:installed,elapsedMs:performance.now()-installStart,hostileAmbientBinLinks:process.env.npm_config_bin_links,sourcePolicy:'owned --bin-links=false',ABGAdmission:false});
 assert.equal(installed.kind,'product_install_candidate',JSON.stringify(installed));
 assert.equal(await product.installedProductContentMatches(installed),true);
 await write('readiness-install-completion.json',{status:'passed',completedAt:new Date().toISOString(),elapsedMs:performance.now()-installStart,installId:installed.installId,installedRoot:installed.installedRoot,ABGAdmission:false});
 phase='complete_physical_population';const archivePopulation=await read(join(here,'wrapper-archive-population.json')),physical=[];const directories=[],nonregular=[];
 const visit=async(absolute,rel='')=>{for(const name of (await (await import('node:fs/promises')).readdir(absolute)).sort()){const path=join(absolute,name),n=rel?rel+'/'+name:name,st=await lstat(path);if(st.isSymbolicLink()){nonregular.push({path:n,kind:'symlink'});continue;}if(st.isDirectory()){directories.push(n);await visit(path,n);}else if(st.isFile()){const bytes=await readFile(path);physical.push({path:n,bytes:bytes.length,sha256:hashBytes(bytes),mode:st.mode&0o777});}else nonregular.push({path:n,kind:'other'});}};
 await visit(installed.installedRoot);physical.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);directories.sort();
 await write('positive-complete-physical-population.json',{status:'observed',regularMembers:physical.length,nonRegularMembers:nonregular.length,records:physical,directories,nonregular});
 assert.deepEqual(nonregular,[],'no added nonregular payload');assert.deepEqual(physical,archivePopulation.records,'every original wrapper regular body and mode preserved');assert.deepEqual(directories,archivePopulation.directories,'complete implied directory population unchanged');
 phase='declared_exports_and_commands';const installedRoot=installed.installedRoot,pkg=await read(join(installedRoot,'package.json'));
 const module=await loadPackageExport(installedRoot,item.verified.packageName,'.');assert.equal(module.SEMANTICS.kind,'product_semantics_provider');assert.equal(module.SEMANTICS.packageName,item.verified.packageName);
 const manifestLocators=[];
 for(const [name,entry] of Object.entries(pkg.exports)){
  const loc=typeof entry==='string'?entry:entry.import;const path=resolve(installedRoot,loc),rel=relative(installedRoot,path);assert.ok(rel&&!isAbsolute(rel)&&!rel.startsWith('..'));assert.equal((await lstat(path)).isFile(),true);
  if(loc.endsWith('.json'))await read(path);
  manifestLocators.push({name,locator:loc,exists:true});
 }
 const guardRoot=join(installedRoot,'node_modules/@abiogenesis/typescript-tenant'),guard=await read(join(guardRoot,'package.json'));const cli=[];
 for(const [name,loc] of Object.entries(guard.bin)){const path=resolve(guardRoot,loc),st=await lstat(path);assert.equal(st.isFile(),true);assert.ok(st.mode&0o111);cli.push({name,locator:loc,mode:st.mode&0o777,sha256:hashBytes(await readFile(path))});}
 const guardValidator=await loadPackageExport(guardRoot,'@abiogenesis/typescript-tenant','./validator');assert.equal(typeof guardValidator.isQualificationAssessmentInput,'function');
 await write('declared-public-surfaces.json',{exports:manifestLocators,fixtureModuleImported:true,pureHistoricalGuardValidatorImported:true,cliFiles:cli,binSymlinksRequired:false,executedCLIPrograms:0});
 phase='nearest_symlink_negative';const badLink=join(installedRoot,'node_modules/.bin/introduced-readiness-link');await mkdir(join(installedRoot,'node_modules/.bin'),{recursive:true});await symlink('../@abiogenesis/typescript-tenant/build/code/src/public/cli.js',badLink);mutatedPath=badLink;
 const symlinkRejected=await product.installedProductContentMatches(installed);await write('negative-symlink.json',{introducedPath:badLink,target:'../@abiogenesis/typescript-tenant/build/code/src/public/cli.js',contentMatches:symlinkRejected,expected:false,unchangedStrictReader:true});assert.equal(symlinkRejected,false);await unlink(badLink);mutatedPath=null;await (await import('node:fs/promises')).rmdir(join(installedRoot,'node_modules/.bin'));
 assert.equal(await product.installedProductContentMatches(installed),true);
 phase='nearest_changed_regular_body_negative';const changed=join(installedRoot,'build/index.js'),original=await readFile(changed);await writeFile(join(here,'negative-body.preimage.js'),original,{flag:'wx'});const changedBytes=Buffer.concat([original,Buffer.from('\n// controlled readiness counterexample\n')]);await writeFile(changed,changedBytes);mutatedPath=changed;
 const bodyRejected=await product.installedProductContentMatches(installed);await write('negative-changed-body.json',{path:changed,originalSHA256:hashBytes(original),changedSHA256:hashBytes(changedBytes),originalBytes:original.length,changedBytes:changedBytes.length,contentMatches:bodyRejected,expected:false});assert.equal(bodyRejected,false);await writeFile(changed,original);mutatedPath=null;assert.equal(await product.installedProductContentMatches(installed),true);
 await write('negative-restoration.json',{status:'restored',bodySHA256:hashBytes(await readFile(changed)),introducedSymlinkRemoved:true,contentMatches:true});
 await write('readiness-outcome.json',{status:'PASSED',phase:'source_built_published_port_and_nearest_negatives',startedAt,closedAt:new Date().toISOString(),elapsedMs:performance.now()-start,hostileNpmConfigBinLinks:'true',positiveInstall:'product_install_candidate',symlinkNegative:false,changedBodyNegative:false,restoredContentMatches:true,installedRoot,lockId:lock.lockId,installId:installed.installId,ABGAdmission:false,providerCalls:0,qualificationCredit:false});
 console.log(JSON.stringify({status:'PASSED',phase,elapsedMs:performance.now()-start,installedRoot,providerCalls:0,ABGAdmission:false}));
}catch(error){await write('readiness-first-failure.json',{status:'FIRST_FAILURE_STOPPED',phase,startedAt,closedAt:new Date().toISOString(),error:{name:error.name,message:error.message,stack:error.stack},mutatedPath,providerCalls:0,ABGAdmission:false});console.error(JSON.stringify({status:'FIRST_FAILURE_STOPPED',phase,error:error.message}));process.exitCode=1;}
