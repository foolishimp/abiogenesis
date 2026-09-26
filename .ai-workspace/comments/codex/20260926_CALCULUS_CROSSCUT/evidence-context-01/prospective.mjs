// Finite presentation feasibility discriminator; no source edit or new bound.
import {input,captured,hash,canonicalJson,stage,directory} from './measure.mjs';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const digest=v=>'sha256:'+createHash('sha256').update(v).digest('hex');
const same=(a,b)=>canonicalJson(a)===canonicalJson(b),refs=new Map(),byteRefs=new Map(),byteTexts=new Map();
const reference=(value,path)=>({presentationRef:path,materialDigest:hash(value)});
const candidates=input.revisionBasis.historicalAssets.map((a,n)=>[a.candidate,`#/task/historicalAssets/${n}/candidate`]);
const bytesView=(base64,path)=>{
 const bytes=Buffer.from(base64,'base64'),d=digest(bytes);if(byteRefs.has(d))return byteRefs.get(d);
 const text=bytes.toString('utf8'),identity={digest:d,byteLength:bytes.length};let view={...identity,disposition:'utf8_text',text};
 byteTexts.set(d,{text,path});
 byteRefs.set(d,{...identity,presentationRef:path});return view;
};
for(const [n,s]of captured.source.entries())byteRefs.set(digest(Buffer.from(s.text)),{disposition:'utf8_text',digest:digest(Buffer.from(s.text)),byteLength:Buffer.byteLength(s.text),presentationRef:`#/source/${n}/text`});
const context=(v,path)=>{const d=hash(v);if(refs.has(d))return refs.get(d);refs.set(d,reference(v,path));return {...v,entries:v.entries.map((e,n)=>{if(e.state!=='file')return e;const {bytes,encoding,...id}=e;return {...id,sourceEncoding:encoding,textView:bytesView(bytes,path+'/entries/'+n+'/textView')};})};};
const bindingInstruction=input.current.evidence.constructionResult.task.instructions.find(s=>s.startsWith('Active paired realization/proof obligations: '));
const active=JSON.parse(bindingInstruction.slice('Active paired realization/proof obligations: '.length));
const bindingView=active.map((v,n)=>{const{versionRef,versionDigest,templateRef,previousVersionRef,binding,policy,shape,...provenance}=v;return {...reference(v,`#/obligations/activeBindings/${n}`),interpretation:'complete_binding_version',provenance};});
const prefixes=[['Ordinary task: ',input.current.job.taskData,reference(input.current.job.taskData,'#/task/taskData')],
 ['Active paired realization/proof obligations: ',active,bindingView],
 ['Current Design: ',input.current.assets.at(-1).candidate.design,reference(input.current.assets.at(-1).candidate.design,'#/predecessors/3/candidate/design')],
 ['Current admitted semantic assets: ',input.current.assets,input.current.assets.map((a,n)=>reference(a,'#/predecessors/'+n))],
 ['Revision feedback: ',{selection:input.revisionBasis.selection,historicalAssets:input.revisionBasis.historicalAssets,retainedTerms:input.revisionBasis.retainedTerms},{selection:reference(input.revisionBasis.selection,'#/task/revisionContext/selection'),historicalAssets:reference(input.revisionBasis.historicalAssets,'#/task/historicalAssets'),retainedTerms:reference(input.revisionBasis.retainedTerms,'#/obligations/retainedTerms')}]];
const instruction=s=>{for(const[prefix,v,view]of prefixes)if(s===prefix+canonicalJson(v))return {disposition:'canonical_json_text',prefix,value:view,digest:digest(Buffer.from(s)),byteLength:Buffer.byteLength(s)};return s;};
const work=(v,path)=>{const d=hash(v);if(refs.has(d))return refs.get(d);refs.set(d,reference(v,path));const before=context(v.before,path+'/before'),after=v.after===null?null:context(v.after,path+'/after');return {...v,before,after,task:{...v.task,context:context(v.task.context,path+'/task/context'),instructions:v.task.instructions.map(instruction)}};};
const e=input.current.evidence,path='#/evidence/observed';
const constructionResult=work(e.constructionResult,path+'/constructionResult');
const obs=e.executionObservation;
const stream=(s,p)=>{const {payload,encoding,...id}=s;return {...id,sourceEncoding:encoding,textView:bytesView(payload,p+'/textView')};};
const environmentRefs=new Map();
const sharedEnvironment=(v,n)=>{const d=hash(v);if(environmentRefs.has(d))return environmentRefs.get(d);environmentRefs.set(d,reference(v,path+'/executionObservation/task/commands/'+n+'/environment'));return v;};
const executionObservation={...obs,task:{...obs.task,sourceNativeWork:work(obs.task.sourceNativeWork,path+'/executionObservation/task/sourceNativeWork'),commands:obs.task.commands.map((c,n)=>({...c,environment:sharedEnvironment(c.environment,n)}))},commandResults:obs.commandResults.map((c,n)=>({...c,stdout:stream(c.stdout,path+'/executionObservation/commandResults/'+n+'/stdout'),stderr:stream(c.stderr,path+'/executionObservation/commandResults/'+n+'/stderr')}))};
const observed={...e,kind:'semantic_worksite_evidence_text_view',rawEvidenceDigest:hash(e),constructionResult,executionObservation,artifacts:e.artifacts.map(({base64,...id},n)=>({...id,textView:bytesView(base64,path+'/artifacts/'+n+'/textView')}))};
const historicalAssets=captured.task.historicalAssets.map((a,n)=>{for(const {text,path} of byteTexts.values()){try{if(same(JSON.parse(text),input.revisionBasis.historicalAssets[n].candidate))return {...a,candidate:{presentationRef:path,interpretation:'exact_json_candidate',candidateDigest:hash(input.revisionBasis.historicalAssets[n].candidate)}};}catch{}}return a;});
const sections={...captured,task:{...captured.task,historicalAssets},evidence:{...captured.evidence,observed}};
const prompt=stage.assembly.sectionOrder.map(n=>'## '+n+'\n'+canonicalJson(sections[n])).join('\n\n');
const result={scope:'Prospective lossless presentation feasibility only; same retained selection and unchanged bound.',promptBytes:Buffer.byteLength(prompt),maxPromptBytes:stage.assembly.maxPromptBytes,evidenceBytes:Buffer.byteLength(canonicalJson(sections.evidence)),evidenceFields:Object.fromEntries(Object.entries(observed).map(([k,v])=>[k,Buffer.byteLength(canonicalJson(v))])),sourceTouched:false};
fs.writeFileSync(directory+'/prospective.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
