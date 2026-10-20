import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as product from './build-01/code/src/product/index.js';
import * as current from './build-01/code/src/gtl/worksite_command_execution.js';
import * as prior from '../successor-41/build-01/code/src/gtl/worksite_command_execution.js';
import {runEnvironmentForProgram} from './build-01/code/src/gtl/stdo_run_environment.js';
import {renderWorksiteCommandExecutionPrompt} from './build-01/code/src/product/worksite_command_execution.js';
const root=fileURLToPath(new URL('.',import.meta.url)),stage=join(root,'input-01'),hash=product.sha256Canonical;
const artifact={productId:product.ABI5_PRODUCT_ID,packageName:product.ABI5_PACKAGE_NAME,packageVersion:product.ABI5_PACKAGE_VERSION,
 artifactDigest:hash('supplied-component-artifact'),productContentDigest:hash('supplied-component-content'),productManifestDigest:hash('supplied-component-manifest')};
const publication=current.constructWorksiteCommandExecutionModulePublication(artifact),oldPublication=prior.constructWorksiteCommandExecutionModulePublication(artifact);
const program=publication.programs.find(row=>row.programRef===product.WORKSITE_COMMAND_EXECUTION_IDS.programRef),oldProgram=oldPublication.programs.find(row=>row.programRef===program.programRef);
const environment=runEnvironmentForProgram(publication,program),oldEnvironment=runEnvironmentForProgram(oldPublication,oldProgram);
assert(environment&&oldEnvironment);
assert.equal(hash(program),hash(oldProgram));assert.equal(hash(publication.programs),hash(oldPublication.programs));
assert.equal(hash(publication.graphFunctions),hash(oldPublication.graphFunctions));
assert.equal(hash({...oldPublication,runEnvironments:publication.runEnvironments}),hash(publication),'only the complete declared run-environment value changes in this controlled-artifact publication comparison');
const role=environment.roles[0],oldRole=oldEnvironment.roles[0];assert.deepEqual(role.policy,oldRole.policy);
assert.equal(role.policy.text,renderWorksiteCommandExecutionPrompt.toString());
const members=[];
for(const context of environment.contexts)for(const member of context.members){
 const bytes=readFileSync(join(stage,member.path));assert.equal(bytes.length,member.byteCount);assert.equal(product.sha256Bytes(bytes),member.digest);
 for(const role of environment.roles)for(const span of role.sourceBindings.filter(row=>row.memberRef===member.memberRef)){
  const selected=bytes.subarray(span.startByte,span.endByte);assert.equal(product.sha256Bytes(selected),span.spanDigest);assert.equal(selected.toString('utf8'),role.policy.text);
  const before=readFileSync(join(root,'../successor-40/build-01/code/src/product/worksite_command_execution.js'));
  const oldSpan=oldRole.sourceBindings.find(row=>row.memberRef===member.memberRef);assert(before.subarray(oldSpan.startByte,oldSpan.endByte).equals(selected));
  members.push({path:member.path,byteCount:bytes.length,digest:product.sha256Bytes(bytes),memberRef:member.memberRef,
   startByte:span.startByte,endByte:span.endByte,spanByteCount:selected.length,spanDigest:span.spanDigest,old40PolicyBytesEqual:true});
 }
}
const inventory=current.WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY;
assert.equal(product.sha256Bytes(Buffer.from(inventory.content)),environment.dependencies[0].recordDigest);
const recordPath=join(stage,inventory.path);mkdirSync(dirname(recordPath),{recursive:true});writeFileSync(recordPath,inventory.content,{flag:'wx'});
const result={kind:'source42_context_owner_correspondence',sourceCut:42,artifactBasis:'same controlled component artifact for old41/new42 definition comparison; no installed/admitted identity',
 members,policy:{textAndDigestEqual41:true,digest:role.policy.digest},programs:{byteCanonicalEqual41:true,selectedProgramDigest:hash(program),completeProgramsDigest:hash(publication.programs)},
 graphFunctions:{byteCanonicalEqual41:true,completeGraphFunctionsDigest:hash(publication.graphFunctions)},
 completePublicationEqualAfterReplacingOnlyRunEnvironments:true,
 changedIdentities:{runEnvironment:{old:hash(oldEnvironment),current:hash(environment)},inventoryRecord:{old:oldEnvironment.dependencies[0].recordDigest,current:environment.dependencies[0].recordDigest},
 contextInventory:{old:oldEnvironment.contexts[0].inventoryDigest,current:environment.contexts[0].inventoryDigest},publication:{old:hash(oldPublication),current:hash(publication)}},
 inventory:{path:recordPath,digest:product.sha256Bytes(Buffer.from(inventory.content)),byteCount:Buffer.byteLength(inventory.content)},
 limits:['Pure existing GTL/context declaration owners and actual isolated member bytes; no normal manifest/capability generation, Product publication/install or runtime admission','Complete Program/GraphFunction equality uses same declared controlled artifact coordinates; actual canonical Product identity consequences remain ordinary publication proof']};
for(const pair of Object.values(result.changedIdentities))assert.notEqual(pair.old,pair.current);
writeFileSync(join(root,'context-owner-correspondence.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({kind:result.kind,selectedProgramDigest:result.programs.selectedProgramDigest,members:result.members,policyDigest:result.policy.digest,changedIdentities:result.changedIdentities}));
