#!/usr/bin/env node
// Controlled mechanical transport actor. This is not an independent semantic assessor.
// Future Runtime grant copies this draft into its own territory with exact adjacent inputs.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const cfg=JSON.parse(readFileSync(new URL('./controlled-response-binding.json',import.meta.url),'utf8'));
assert.equal(cfg.claim,'mechanical_transport_only');
const chunks=[];for await (const c of process.stdin)chunks.push(c);
const prompt=Buffer.concat(chunks);
assert.equal(prompt.length,cfg.promptUtf8Bytes,'full selected prompt is consumed');
assert.equal(createHash('sha256').update(prompt).digest('hex'),cfg.promptUtf8SHA256);
const rawBytes=readFileSync(new URL('./controlled-raw-response.json',import.meta.url));
assert.equal(createHash('sha256').update(rawBytes).digest('hex'),cfg.rawResponseSHA256);
const raw=JSON.parse(rawBytes);
assert.equal(raw.kind,'qualification_raw_judgment');
assert.ok(raw.criteria.length>0);
assert.ok(raw.criteria.every(x=>x.disposition==='indeterminate'&&x.applicability==='unknown'&&x.grouping==='unknown'));
assert.ok(raw.residuals.includes('residual://independent-semantic-assessment-open'));
console.log(JSON.stringify({type:'system',subtype:'init'}));
console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(raw),structured_output:raw}));
