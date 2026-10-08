#!/opt/homebrew/bin/node
// Declared local protocol response data. There is no model or adequacy verdict.
import assert from 'node:assert/strict';
import {readFileSync,appendFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
let prompt='';for await(const chunk of process.stdin)prompt+=chunk.toString('utf8');
const sections={};for(const part of prompt.split(/^## /m).slice(1)){
  const cut=part.indexOf('\n');try{sections[part.slice(0,cut)]=JSON.parse(part.slice(cut+1).trim());}catch{}
}
const schemaIndex=process.argv.indexOf('--json-schema');
const schema=schemaIndex<0?null:JSON.parse(process.argv[schemaIndex+1]);
const emit=value=>process.stdout.write(JSON.stringify(value)+'\n');
emit({type:'system',subtype:'init',model:'declared-local-protocol-fixture'});
let response;
if(schema?.properties?.interpretation){
  const task=sections.task,observations=task.observations;
  assert.ok(Array.isArray(observations),'owned planning task required');
  const count=observations.length,purpose=['testing','construction','testing','uat'][count]??null;
  const graph=purpose===null?null:schema.properties.contributions.items.properties.graphFunctionRef.enum.find(r=>r.endsWith('/'+purpose+'@5'));
  if(purpose!==null)assert.ok(graph,'exact current registered purpose');
  const subjects=task.subjectEvidenceDomains[purpose]??[];
  const subject=purpose==='testing'&&count===2?observations.find(o=>o.purpose==='construction').resultRef:
    purpose==='uat'?observations.filter(o=>o.purpose==='testing').at(-1).resultRef:null;
  if(subject!==null)assert.ok(subjects.includes(subject),'source in current purpose domain');
  const support=schema.properties.contributions.items.properties.supportRefs.items.enum??[];
  const evidence=schema.properties.nextEvidenceRefs.items.enum??[];
  const reason='Disclosed finite local protocol witness; original semantic adequacy remains unmet.';
  const contribution=purpose==='construction'?'Append one fixture marker inside the declared native write scope and return a partial report.':
    purpose==='uat'?'Assess the original local fixture obligations and retain unmet semantic adequacy.':'Execute the full declared fixture command and retain its actual nonzero observation.';
  response={interpretation:reason,contributions:graph===null?[]:[{graphFunctionRef:graph,contribution,reason,supportRefs:support,evidenceRefs:evidence,dependsOn:[]}],
    gaps:graph===null?[{supportRefs:support,reason,evidenceRefs:evidence}]:[],nextGraphFunctionRef:graph,nextReason:reason,nextEvidenceRefs:evidence,
    subjectEvidenceRef:subject,revisionReason:reason,revisionEvidenceRefs:evidence};
}else{
  const c2=schema?.properties?.kind?.const==='worksite_command_execution_worker_result';
  const text=c2?sections.task?.ownerPrompt:(sections.task?.ownerPrompt??prompt);assert.equal(typeof text,'string','owned native prompt required');
  if(schema?.properties?.kind?.const==='worksite_command_execution_worker_result'){
    const input=text.split('\n').map(line=>{try{return JSON.parse(line);}catch{return null;}}).find(v=>typeof v?.command==='string'&&v.command.includes('worksite_command_helper.js'));
    assert.ok(input,'exact owned C2 helper tool input');
    emit({type:'assistant',message:{content:[{type:'tool_use',id:'toolu_local_c2',name:'Bash',input}]}});
    const ran=spawnSync('/bin/sh',['-c',input.command],{encoding:'utf8',maxBuffer:4*1024*1024});
    assert.equal(ran.status,0,ran.stderr);response=JSON.parse(ran.stdout);
  }else if(schema?.properties?.summary){
    const root=text.match(/^Worksite root: (.+)$/m)?.[1],writes=JSON.parse(text.match(/^Permitted write scope: (.+)$/m)?.[1]??'null');
    assert.ok(writes?.includes('generated/hello-world.mjs'),'exact native grant');
    const target=join(root,'generated/hello-world.mjs');readFileSync(target);
    emit({type:'assistant',message:{content:[{type:'tool_use',id:'toolu_local_edit',name:'Edit',input:{file_path:target}}]}});
    appendFileSync(target,'// native protocol marker Ω😀\n');
    response={summary:'Appended the declared native fixture marker.',gaps:['Full original semantic adequacy remains unproved.']};
  }else{
    assert.ok(text.includes('Exact assessment basis:'),'exact original assessment input');
    const root=text.match(/^Worksite root: (.+)$/m)?.[1],paths=JSON.parse(text.match(/^Read first: (.+)$/m)?.[1]??'null');
    for(const path of paths)readFileSync(join(root,path));
    response={kind:'consumer_outcome_assessment',disposition:'unmet',reason:'Disclosed local protocol fixture does not judge semantic adequacy.',unresolvedCriteria:['Full original semantic adequacy']};
  }
}
emit({type:'result',subtype:'success',is_error:false,...(schema===null?{result:JSON.stringify(response)}:{structured_output:response}),
  duration_ms:0,duration_api_ms:0,num_turns:1,total_cost_usd:0});
