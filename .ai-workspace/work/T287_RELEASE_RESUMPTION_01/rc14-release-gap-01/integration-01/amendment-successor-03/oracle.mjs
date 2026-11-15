// Domain oracle only. Native Testing or the external finite command owner owns execution.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const [worksite,phase]=process.argv.slice(2);
assert(['observe','final'].includes(phase));
const oracle=JSON.parse(await readFile(new URL('./ORACLE.json',import.meta.url),'utf8'));
const {priceOrder}=await import(pathToFileURL(join(worksite,'src/order.mjs')).href);
const rows=oracle.cases.map(row=>{const value=priceOrder(row.lines);return {id:row.id,expected:{total:row.total,managerApproval:row.managerApproval},observed:value,met:Math.abs(value.total-row.total)<0.005&&value.managerApproval===row.managerApproval};});
const mismatches=rows.filter(row=>!row.met).map(row=>row.id);
console.log(JSON.stringify({phase,rows,mismatches,kind:'amendment_application_observation'}));
// Nonzero application results remain ordinary command observations in C2.
// The caller that admitted the command, not this script, supplies provenance.
if(phase==='final')assert.deepEqual(mismatches,[]);
else if(mismatches.length)process.exitCode=1;
