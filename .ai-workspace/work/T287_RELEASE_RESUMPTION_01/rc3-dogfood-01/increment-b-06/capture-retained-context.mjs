// Actual RC2 historical setup-prefix projection, re-observed with installed
// Product owner and required to equal the successful current preflight digest.
import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { installedModules } from './public-setup.mjs';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01',dir=join(base,'increment-b-06');
const setup=JSON.parse(await readFile(join(base,'setup-002/operator-resume-material.json'),'utf8'));
const prior=JSON.parse(await readFile(join(base,'setup-002/operator-resume-material.json'),'utf8'));
const w=JSON.parse(await readFile(join(dir,'workload.json'),'utf8')),p=JSON.parse(await readFile(join(dir,'model-free-preflight.json'),'utf8'));
const {product,abg}=await installedModules(setup.installedRoot);
const env=abg.projectExactPrefixWorkspaceEnvironment(setup.state.closeHandoff.prefix,prior.state.binding);
assert.equal(env.kind,'exact_prefix_workspace_environment');
assert.equal(env.workspaceBinding.bindingId,prior.state.binding.ref);assert.equal(env.workspaceBinding.bindingDigest,prior.state.binding.digest);
assert.equal(env.workspaceAuthorityBasis.authorityBasisId,prior.workspaceAuthority.authorityBasisId);
assert.equal(env.workspaceAuthorityBasis.authorityBasisDigest,prior.workspaceAuthority.authorityBasisDigest);
const protectedInstallRoots=env.productInstalls.map(i=>i.installedRoot);
const context=await product.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
 protectedInstallRoots,readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
assert.equal(context.kind,'worksite_context_observation');assert.equal(context.observationDigest,p.contextDigest,'owner reacquisition differs from actual current preflight');
const out={kind:'rc3_b06_retained_preflight_authority',classification:'RC2 setup-prefix owner projection, re-observed and matched to the successful current preflight; predictive only',
 sourceSetupPrefix:setup.state.closeHandoff.prefix,workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
 protectedInstallRoots,matchedPreflightContextDigest:context.observationDigest,
 limits:['No current native admission or Result created','Actual B06 native invocation authenticates its own current owner and grant']};
await writeFile(join(dir,'RETAINED_PREFLIGHT_AUTHORITY.json'),JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({kind:out.kind,contextDigest:context.observationDigest,binding:env.workspaceBinding.bindingId}));
