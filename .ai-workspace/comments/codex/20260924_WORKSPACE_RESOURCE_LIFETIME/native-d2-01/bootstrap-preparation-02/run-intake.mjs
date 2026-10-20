import {executeFullSandbox} from './caller/test/full-sandbox-support.mjs';
const receipt=await executeFullSandbox(process.argv[2],process.env);
console.log(JSON.stringify({kind:'native_intake_boundary',outcome:receipt.ownerOutput,close:receipt.resources.eventResource.closeHandoff.prefix}));
