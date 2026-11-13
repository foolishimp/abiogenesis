import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {loadReuse,dir,sha} from './reuse-state.mjs';
assert.equal(process.argv.length,3,'usage: node prepare-reuse.mjs ROOT_SELECTION_SHA256_HEX');
assert.equal(sha(await readFile(join(dir,'ROOT_REUSE_SELECTION.json'))),process.argv[2]);
const {selection}=await loadReuse();
console.log(JSON.stringify({status:'existing_setup_return_and_prefix_verified',runId:selection.runId,sourceCommit:selection.sourceCommit,eventPrefix:selection.eventPrefix,providerCalls:0,publicCalls:0,newSetup:false}));
