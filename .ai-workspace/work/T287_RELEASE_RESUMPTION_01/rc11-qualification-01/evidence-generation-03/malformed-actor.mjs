#!/usr/bin/env node
// Declared deterministic provider stand-in. No tools, file writes or network.
let prompt='';for await(const chunk of process.stdin)prompt+=chunk;
process.stdout.write(JSON.stringify({type:'system',subtype:'init'})+'\n');
process.stdout.write(JSON.stringify({type:'result',subtype:'success',is_error:false,result:'{not-json'})+'\n');
