import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {join,posix} from 'node:path';
import {pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {assessmentContract,witnessRef} from './default-library.mjs';

// The amendment witness: one person's change to an accepted specification,
// joined deterministically with a process defined once for the system.
export const amendmentRef=(kind,name)=>`${kind}://amendment-witness/${name}@5`;
export const witnessFixtureRoot=new URL('../fixtures/amendment-witness/',import.meta.url).pathname;
const sha256=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');

// Specification readers, shared by the joining function and the stand-in assessor.
export function requirementId(text){return /^# (REQ-[A-Z0-9-]+):/m.exec(text)?.[1]??null;}
const tableRows=section=>section.split('\n').filter(l=>/^\|/.test(l)).map(l=>l.split('|').slice(1,-1).map(c=>c.trim()));
const list=cell=>cell.split(',').map(s=>s.trim()).filter(Boolean);
export function parseTrace(text){
  const section=text.split(/^## Traceability[ \t]*$/m)[1];if(section===undefined)return null;
  return tableRows(section).filter(([r])=>/^REQ-/.test(r)).map(([requirement,realizedBy,verifiedBy])=>({requirement,realizedBy:list(realizedBy),verifiedBy:list(verifiedBy)}));
}
const amount=cell=>Number(cell.replaceAll(',',''));
const field=header=>header.toLowerCase().split(/\s+/).map((w,i)=>i===0?w:w[0].toUpperCase()+w.slice(1)).join('');
/** Whole-order examples: the first column is the order lines, every other column a result field. */
export function parseExamples(text){
  const section=text.split(/^## Examples[ \t]*$/m)[1];if(section===undefined)return null;
  const [header,...rows]=tableRows(section).filter(r=>!r.every(c=>/^-+$/.test(c)));
  return rows.map(cells=>({lines:cells[0].split('+').map(part=>{const [q,p]=part.split('×').map(s=>s.trim());return {quantity:amount(q),unitPrice:amount(p)};}),
    expected:Object.fromEntries(header.slice(1).map((h,i)=>[field(h),cells[i+1]==='yes'?true:cells[i+1]==='no'?false:amount(cells[i+1])]))}));
}
export function renderFrame(name,f){
  return `${name[0].toUpperCase()+name.slice(1)} review frame. Evaluation family: ${f.family} Subject: ${f.subject} Basis: ${f.basis} Authority: ${f.authority.join('; ')}. `+
    `Admissible evidence: ${f.evidence} Excluded: ${f.excluded} Capability: ${f.capability} Result: ${f.result} Return: ${f.return}`;
}

/** The process's prerequisites as the consumer Program declares them on its executive step: purpose to review refs. */
export function amendmentPrerequisites(def){
  return Object.fromEntries(Object.entries(def.prerequisites).filter(([k])=>k!=='meaning').map(([purpose,names])=>[purpose,names.map(n=>amendmentRef('review',n))]));
}
/**
 * Applies the amendment to the requirement file under seedRoot (a worksite copy,
 * never the fixture) and returns the governance input. No model call. The
 * amendment carries only its statement and the new requirement text; the
 * requirement is named by the text's heading.
 */
export async function amendmentWitnessInput({processDefinition:def,amendment,seedRoot,product}){
  assert.deepEqual(Object.keys(amendment).sort(),['statement','text'],'an amendment is its statement and new text only');
  const id=requirementId(amendment.text);assert.ok(id,'the amended text names its requirement');
  const requirementPath=`${def.system.requirementsRoot}/${id}.md`;
  assert.ok(def.system.files.includes(requirementPath),`${id} is a requirement of this system`);
  const before=await readFile(join(seedRoot,requirementPath),'utf8');
  const trace=parseTrace(await readFile(join(seedRoot,def.system.trace),'utf8')),amended=trace?.find(r=>r.requirement===id);
  assert.ok(amended,`the trace names ${id}`);
  const others=trace.filter(r=>r.requirement!==id),otherFiles=new Set(others.flatMap(r=>[...r.realizedBy,...r.verifiedBy]));
  const unique=xs=>[...new Set(xs)];
  const roles={'@amended.requirement':[requirementPath],'@amended.realization':amended.realizedBy,
    '@amended.primary':amended.realizedBy.filter(p=>!otherFiles.has(p)),'@amended.shared':amended.realizedBy.filter(p=>otherFiles.has(p)),
    '@amended.tests':amended.verifiedBy,'@other.requirements':others.map(r=>`${def.system.requirementsRoot}/${r.requirement}.md`),
    '@other.realization':unique(others.flatMap(r=>r.realizedBy)).filter(p=>!amended.realizedBy.includes(p)),
    '@other.tests':unique(others.flatMap(r=>r.verifiedBy)).filter(p=>!amended.verifiedBy.includes(p)),'@trace':[def.system.trace]};
  const resolve=xs=>unique(xs.flatMap(x=>{if(!x.startsWith('@'))return [x];assert.ok(Object.hasOwn(roles,x),`unknown role ${x}`);return roles[x];}));
  const one=x=>{const r=resolve([x]);assert.equal(r.length,1,`${x} must name exactly one file; a review or acceptance subject is one candidate file`);return r[0];};
  await writeFile(join(seedRoot,requirementPath),amendment.text);
  const examplesChanged=!isDeepStrictEqual(parseExamples(before),parseExamples(amendment.text));
  const applies=a=>a.applies==='always'||a.applies==='examples-changed'&&examplesChanged;
  const declared=def.reviews.filter(r=>applies(r.applicability)),reviewRefOf=name=>amendmentRef('review',name);
  const workOrders=Object.fromEntries(def.stages.map(s=>[s.purpose,{outcome:s.outcome,instructions:[...s.instructions],
    readFirst:resolve(s.readFirst),writeRoots:resolve(s.writeRoots),checks:[]}]));
  const writeRoots=new Set(Object.values(workOrders).flatMap(o=>o.writeRoots));
  const protectedPaths=def.system.files.filter(p=>!writeRoots.has(p));
  const sources=await Promise.all(protectedPaths.map(async path=>({path,digest:product.sha256Bytes(await readFile(join(seedRoot,path)))})));
  const schemaBytes=await readFile(join(seedRoot,def.acceptance.resultSchema));
  const schemaAsset={productId:witnessRef('product','consumer'),contractId:assessmentContract.contractRef,bytesBase64:schemaBytes.toString('base64')};
  const assessment=(candidate,rubric,from)=>({sources:resolve(from),candidatePath:one(candidate),rubricPath:rubric,resultContract:assessmentContract,schemaAsset,verdictField:'disposition',satisfiedValue:'satisfied'});
  const commandId=name=>amendmentRef('command',name),plan=def.testPlan;
  const original={taskRef:amendmentRef('task',id.toLowerCase()),
    task:[...def.task,'',`Requested change: ${amendment.statement}`,'',`Amended requirement (${requirementPath}):`,'',amendment.text].join('\n'),
    sources,requiredSupportRefs:[amendmentRef('support','amended-requirement-realized')],authorityRefs:[amendmentRef('authority','specification-amendment')],
    readRoots:[...def.system.files,...def.system.records].sort(),...def.limits,workOrders,
    testing:{selectedPaths:plan.selectedPaths,commands:plan.commands.map(c=>({commandId:commandId(c.id),executable:c.executable,args:c.args,relativeCwd:'.',environment:{},
      timeoutMs:c.timeoutMs,terminationGraceMs:c.terminationGraceMs,expectedReports:[]})),
      outcomePredicates:plan.predicates.map(p=>({predicateId:amendmentRef('predicate',p.id),predicateKind:p.kind,declaration:{validationCommandId:commandId(p.command),equals:p.equals}})),
      allowedWriteTerritories:plan.writeTerritories},
    assessment:assessment(def.acceptance.candidate,def.acceptance.rubric,def.acceptance.sources),
    // Every review the process names is declared; one that does not apply to this amendment is declared not required.
    reviews:def.reviews.map(r=>({reviewRef:reviewRefOf(r.name),frame:renderFrame(r.name,r.frame),required:r.required&&declared.includes(r),
      order:{outcome:r.outcome,instructions:[...r.instructions,`Applicability: ${r.applicability.notApplicable}`],readFirst:[r.rubric],writeRoots:[],checks:[]},
      assessment:assessment(r.candidate,r.rubric,r.sources)}))};
  const state=product.constructGovernanceWorkState(original);
  return {state,derivation:{requirementId:id,requirementPath,roles,examplesChanged,writeRoots:[...writeRoots].sort(),protectedPaths,
    reviews:declared.map(r=>({name:r.name,reviewRef:reviewRefOf(r.name)})),notApplicable:def.reviews.filter(r=>!declared.includes(r)).map(r=>r.name)}};
}

// Deterministic rubric reader: one criterion per line, "- <ID>: <criterion> Check: <form>."
export function parseRubric(text){
  return {review:/^Review: (\S+)[ \t]*$/m.exec(text)?.[1]??null,
    criteria:text.split('\n').flatMap(line=>{const m=/^- ([A-Z][0-9]+): (.*?) Check: (.*?)\.?$/.exec(line);return m?[{id:m[1],statement:m[2],check:m[3]}]:[];})};
}
/** Runs the system's current files in a fresh child process (no module cache, no shared state). */
function runExamples(url,name,inputs){
  const script=`let m;try{m=await import(${JSON.stringify(url)});}catch(e){console.log(JSON.stringify({error:'cannot load: '+e.message}));process.exit(0);}
const f=m[${JSON.stringify(name)}];if(typeof f!=='function'){console.log(JSON.stringify({error:'no such export'}));process.exit(0);}
console.log(JSON.stringify({out:JSON.parse(process.argv[1]).map(lines=>{try{return {ok:true,value:f(lines)};}catch(e){return {ok:false,error:String(e)};}})}));`;
  const r=spawnSync(process.execPath,['--input-type=module','-e',script,JSON.stringify(inputs)],{encoding:'utf8',env:{},timeout:20_000});
  try{return JSON.parse(r.stdout);}catch{return {error:'no result: '+String(r.stderr).slice(0,300)};}
}
async function evaluateCheck(check,c){
  const line=label=>{const row=c.candidate.text.split('\n').find(l=>l.startsWith(label+':'));return row===undefined?null:row.slice(label.length+1).trim();};
  const texts=await Promise.all(c.sources.map(async s=>({...s,text:await readFile(join(c.root,s.path),'utf8').catch(()=>null)})));
  const requirements=texts.filter(s=>s.text!==null&&requirementId(s.text)!==null),trace=texts.map(s=>s.text===null?null:parseTrace(s.text)).find(Boolean)??null;
  const theRequirement=()=>requirements.length===1?requirementId(requirements[0].text):null;
  let m;
  if((m=/^line "(.+)" names one of (.+)$/.exec(check))){const v=line(m[1]);return v===null?{met:false,note:`no "${m[1]}" line`}:{met:m[2].split(',').map(s=>s.trim()).includes(v),note:v};}
  if((m=/^line "(.+)" names the requirement among the sources$/.exec(check))){const id=theRequirement(),v=line(m[1]);
    return id===null?{met:null,note:'not exactly one requirement among the sources'}:{met:v!==null&&v.split(/[\s,()]+/).includes(id),note:`${v} vs ${id}`};}
  if((m=/^line "(.+)" lists every file the trace gives that requirement$/.exec(check))){const id=theRequirement(),v=line(m[1]),row=trace?.find(r=>r.requirement===id);
    if(!row)return {met:null,note:'no trace row for the requirement among the sources'};const missing=[...row.realizedBy,...row.verifiedBy].filter(p=>!(v??'').includes(p));return {met:missing.length===0,note:missing.join(', ')||'all listed'};}
  if((m=/^line "(.+)" lists every requirement and file the trace gives only other requirements$/.exec(check))){const id=theRequirement(),v=line(m[1])??'',row=trace?.find(r=>r.requirement===id);
    if(!row)return {met:null,note:'no trace row for the requirement among the sources'};
    const others=trace.filter(r=>r.requirement!==id),mine=new Set([...row.realizedBy,...row.verifiedBy]);
    const missing=[...others.map(r=>r.requirement).filter(r=>!v.includes(r)),...others.flatMap(r=>[...r.realizedBy,...r.verifiedBy]).filter(p=>!mine.has(p)&&!v.includes(p))];
    return {met:missing.length===0,note:missing.join(', ')||'all listed'};}
  if((m=/^every example of each requirement among the sources holds through (\w+) in (\S+)$/.exec(check))){
    if(requirements.length===0)return {met:null,note:'no requirement among the sources'};
    const examples=requirements.flatMap(r=>(parseExamples(r.text)??[]).map(ex=>({id:requirementId(r.text),...ex})));
    const run=runExamples(pathToFileURL(join(c.root,m[2])).href,m[1],examples.map(ex=>ex.lines));
    if(run.error)return {met:false,note:`${m[2]} ${m[1]}: ${run.error}`};
    const failures=[];
    examples.forEach((ex,i)=>{const got=run.out[i];if(!got.ok){failures.push(`${ex.id} ${JSON.stringify(ex.lines)} threw`);return;}
      for(const [k,want] of Object.entries(ex.expected)){const have=got.value?.[k];if(typeof want==='number'?!(typeof have==='number'&&Math.abs(have-want)<0.005):have!==want)
        failures.push(`${ex.id} ${ex.lines.map(l=>l.quantity+'x'+l.unitPrice).join('+')}: ${k} ${have} != ${want}`);}});
    return {met:failures.length===0,note:failures.join('; ')||'all examples hold'};}
  if(/^the candidate imports every module among the sources$/.test(check)){
    const modules=c.sources.map(s=>s.path).filter(p=>p.endsWith('.mjs')&&!p.includes('.test.'));
    const missing=modules.filter(p=>{let rel=posix.relative(posix.dirname(c.candidate.path),p);if(!rel.startsWith('.'))rel='./'+rel;return !c.candidate.text.includes(`'${rel}'`)&&!c.candidate.text.includes(`"${rel}"`);});
    return modules.length===0?{met:null,note:'no module among the sources'}:{met:missing.length===0,note:missing.length?'does not import '+missing.join(', '):'imports all'};}
  if(/^every source matches its declared digest$/.test(check)){
    const changed=[];for(const s of c.sources){const bytes=await readFile(join(c.root,s.path)).catch(()=>null);if(bytes===null||sha256(bytes)!==s.digest)changed.push(s.path);}
    return {met:changed.length===0,note:changed.join(', ')||'unchanged'};}
  if(/^every command of the current Testing result exited zero$/.test(check)){
    const rows=c.producer?.commandResults;if(!Array.isArray(rows)||rows.length===0)return {met:null,note:'no Testing result in the assessment task'};
    const failed=rows.filter(r=>r.exitStatus!==0).map(r=>r.commandId);return {met:failed.length===0,note:failed.length?'nonzero: '+failed.join(', '):'all zero'};}
  return {met:null,note:'unknown check form'};
}
/**
 * The stand-in assessor's judgment: the declared review name must match the
 * rubric's review, then every criterion's check is applied to the candidate and
 * sources. Any unmet criterion is unmet; otherwise any unevaluable criterion is
 * indeterminate; otherwise satisfied. unresolvedCriteria lists the ids.
 */
export async function assessUnderRubric({reviewName,rubricText,root,candidatePath,sources,producer=null}){
  const rubric=parseRubric(rubricText);
  const candidate={path:candidatePath,text:await readFile(join(root,candidatePath),'utf8')};
  if(rubric.review!==reviewName||rubric.criteria.length===0)return {disposition:'indeterminate',reason:`The rubric is for review "${rubric.review}", not the declared "${reviewName}".`,
    unresolvedCriteria:rubric.criteria.map(c=>c.id),criteria:[]};
  const criteria=[];for(const k of rubric.criteria)criteria.push({id:k.id,...await evaluateCheck(k.check,{root,candidate,sources,producer})});
  const unmet=criteria.filter(c=>c.met===false),unknown=criteria.filter(c=>c.met===null);
  const disposition=unmet.length?'unmet':unknown.length?'indeterminate':'satisfied';
  return {disposition,reason:criteria.map(c=>`${c.id} ${c.met===true?'met':c.met===false?'unmet':'unevaluable'}: ${c.note}`).join(' | '),
    unresolvedCriteria:[...unmet,...unknown].map(c=>c.id),criteria};
}

/**
 * One summary of every actor call in a Run, for scripted and live evidence:
 * the call's graph function, CCall, actor invocation, command, requested model
 * and the model identities its own output stream reports.
 */
export async function summarizeActorCalls(events){
  const bindings=events.filter(e=>e.kind==='actor_transport_binding_admitted'),rows=[];
  for(const binding of bindings){
    const related=events.filter(e=>e.parentAggregateId===binding.parentAggregateId);
    const started=related.find(e=>e.kind==='actor_invocation_started'),closed=related.find(e=>['actor_invocation_closed','actor_invocation_failed'].includes(e.kind));
    const args=binding.payload.args??[],paths=binding.payload.paths??{},stdoutPath=paths.stdoutPath??paths.stdout;
    const stream=stdoutPath?(await readFile(stdoutPath,'utf8').catch(()=>'')).trim().split('\n').filter(Boolean).flatMap(l=>{try{return [JSON.parse(l)];}catch{return [];}}):[];
    const result=stream.findLast(r=>r.type==='result');
    rows.push({parentAggregateId:binding.parentAggregateId,graphFunctionRef:binding.graphFunctionRef??null,
      actorInvocationRef:started?.payload?.actorInvocationRef??null,actorRef:started?.payload?.actorRef??null,command:binding.payload.command,
      requestedModel:args.includes('--model')?args[args.indexOf('--model')+1]:null,
      reportedModels:[...new Set(stream.flatMap(r=>[r.model,r.message?.model,...Object.keys(r.modelUsage??{})]).filter(Boolean))],
      intervalMs:started&&closed?Date.parse(closed.eventTime)-Date.parse(started.eventTime):null,
      costUsd:result?.total_cost_usd??null,usage:result?.usage??null,outcome:closed?.kind??null});
  }
  return rows;
}
