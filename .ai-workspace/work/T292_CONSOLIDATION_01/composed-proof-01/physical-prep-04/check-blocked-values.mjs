// Check only P5's declared blocked-RC7 stop-field deletion on one matched pair.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const [input,expectedLog,tenant,output]=process.argv.slice(2);
const rows=readFileSync(input,'utf8').trim().split('\n').map(JSON.parse);
assert.equal(rows.length,1);const row=rows[0];assert.equal(row.log,expectedLog);
assert.equal(row.base.reopen,'reopened');assert.equal(row.final.reopen,'reopened');
assert.equal(row.base.runs.length,1);assert.equal(row.final.runs.length,1);
const before=row.base.runs[0],after=row.final.runs[0];assert.equal(before.runId,after.runId);
for(const key of ['run_result','run_replay','run_evidence'])assert.deepEqual(before[key],after[key]);
const {sha256Canonical}=await import(pathToFileURL(join(tenant,'build/code/src/shared/digests.js')));
const a=structuredClone(before.run_status.value),b=structuredClone(after.run_status.value);
for(const v of [a,b]){
 assert.equal(v.kind,'abg_project_read_projection');
 const body={memberKey:v.memberKey,targetRef:v.targetRef,prefixCoordinateDigest:v.prefixCoordinateDigest,value:v.value};
 assert.equal(v.projectionDigest,sha256Canonical(body));
 assert.equal(v.projectionRef,'project-read://abiogenesis/'+v.projectionDigest.slice(7));
 delete v.projectionDigest;delete v.projectionRef;
}
assert(Object.hasOwn(a.value.stop,'nextActions'));assert(!Object.hasOwn(b.value.stop,'nextActions'));
assert.equal(a.value.stop.statement,b.value.stop.statement+' No next lawful action is admitted.');
delete a.value.stop.nextActions;a.value.stop.statement=b.value.stop.statement;
assert.deepEqual(a,b,'no other owner field may change');
const result={status:'EXACT_DECLARED_STOP_DELTA',log:expectedLog,runId:before.runId,
 allowed:['value.stop.nextActions removed','exact trailing no-next-action guidance removed','derived projectionRef/projectionDigest'],
 otherPortsEqual:true,allOtherStatusFieldsEqual:true,projectionIdentitiesVerified:true,qualification:false};
writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
