import {executeFullSandbox} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/full-sandbox-support.mjs';
const receipt=await executeFullSandbox(process.argv[2],process.env);
console.log(JSON.stringify({kind:'native_suffix_boundary',outcome:receipt.ownerOutput,close:receipt.resources.eventResource.closeHandoff.prefix}));
