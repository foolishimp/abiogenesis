import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const reference='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/library-joint-proof-237/continuation-12/selected-constructor-discriminator.json';
const bytes=readFileSync(reference),digest=createHash('sha256').update(bytes).digest('hex');
assert.equal(digest,'65bba91757361a23ddc3efd2cf97103525e06ff7b765afa4ec4833f79083ca6d');
const selected=JSON.parse(bytes),input=selected.input;
const current=await import('./build-01/code/src/product/worksite_command_execution.js');
const old=await import('../successor-40/build-01/code/src/product/worksite_command_execution.js');
const {sha256Canonical}=await import('./build-01/code/src/shared/digests.js');
assert.equal(sha256Canonical(input),selected.inputDigest);
assert.deepEqual(input.allowedWriteTerritories,[]);
assert.throws(()=>old.constructWorksiteCommandConfiguration(input),/requires exact A\/W, subjects and explicit arrays/);
const configuration=current.constructWorksiteCommandConfiguration(input);
assert.deepEqual(configuration.allowedWriteTerritories,[]);
assert.equal(current.worksiteCommandConfigurationMatches(input,JSON.parse(JSON.stringify(configuration))),true);
assert.equal(sha256Canonical(input),selected.inputDigest);
const nonempty={...input,allowedWriteTerritories:[{pathKind:'subtree',relativePath:'evidence'}]};
assert.deepEqual(current.constructWorksiteCommandConfiguration(nonempty),old.constructWorksiteCommandConfiguration(nonempty));
const result={kind:'actual_selected_c2_configuration_discriminator',sourceCut:41,reference:{path:reference,sha256:digest,bytes:bytes.length},
  inputDigest:selected.inputDigest,sourceInputDigest:selected.origin.inputDigest,
  old40:'same actual tuple refuses',current41:'same actual tuple constructs and round-trips',
  configurationDigest:sha256Canonical(configuration),nonemptyControl:'complete old/new configuration and digest equal',
  effects:'pure; no resource, workspace, command, native callback or installation effect',
  limits:['Sufficient downstream configuration blocker only; fresh transient native context and unique actual first throw remain unproved.']};
writeFileSync(root+'selected-configuration-result.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
