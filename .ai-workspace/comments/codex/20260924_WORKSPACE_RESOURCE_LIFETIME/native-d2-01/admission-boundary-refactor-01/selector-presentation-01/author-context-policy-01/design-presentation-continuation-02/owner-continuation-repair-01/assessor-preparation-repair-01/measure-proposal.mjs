import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const [out,n]=process.argv.slice(2), core=n+'/preparation/products/core38/node_modules/@abiogenesis/typescript-tenant/build/code/src';
const {canonicalJson}=await import(pathToFileURL(core+'/shared/canonical_json.js'));
const {sha256Canonical:hash,sha256Bytes}=await import(pathToFileURL(core+'/shared/digests.js'));
const before=JSON.parse(fs.readFileSync(out+'/reproduced-sections.json','utf8')), after=structuredClone(before);
if(hash(before.task.revisionContext.retainedTerms)!==hash(before.obligations.retainedTerms))throw Error('not identical typed material');
const link={presentationRef:'#/obligations/retainedTerms',materialDigest:hash(before.obligations.retainedTerms)};
after.task.revisionContext.retainedTerms=link;
const sentence=' task.revisionContext.retainedTerms.presentationRef selects the identical complete obligations.retainedTerms array in listed order; its materialDigest preserves exact typed identity.';
after.role.native+=sentence;
const render=s=>Object.entries(s).map(([key,value])=>'## '+key+'\n'+canonicalJson(value)).join('\n\n');
// The serialized diagnostic record has canonical key order; original section order is the declared order.
const order=['role','source','obligations','predecessors','worksite','evidence','task','response'];
const prompt=s=>order.map(key=>'## '+key+'\n'+canonicalJson(s[key])).join('\n\n');
const restore=structuredClone(after);restore.task.revisionContext.retainedTerms=restore.obligations.retainedTerms;restore.role.native=restore.role.native.slice(0,-sentence.length);
if(hash(restore)!==hash(before))throw Error('not lossless');
const bytes=x=>Buffer.byteLength(canonicalJson(x)), current=Buffer.byteLength(prompt(before)), proposed=Buffer.byteLength(prompt(after));
fs.writeFileSync(out+'/presentation-proposal-measurement.json',JSON.stringify({scope:'Prospective presentation-only transform on component-reproduced sections, not changed installed owner or historical prompt',beforeBytes:current,afterBytes:proposed,maxPromptBytes:1048576,headroomBytes:1048576-proposed,savedBytes:current-proposed,duplicate:{firstRoute:'#/obligations/retainedTerms',repeatedRoute:'#/task/revisionContext/retainedTerms',fullArrayBytes:bytes(before.obligations.retainedTerms),elementCount:before.obligations.retainedTerms.length,digest:hash(before.obligations.retainedTerms),proposedReference:link,referenceBytes:bytes(link)},instructionAddition:{text:sentence,utf8Bytes:Buffer.byteLength(sentence)},roundTripSectionsEqual:hash(restore)===hash(before),unchangedSections:order.filter(k=>!['role','task'].includes(k)).map(k=>({name:k,equal:hash(before[k])===hash(after[k])})),historicalAndCurrentAssetMaterialUnchanged:hash(before.task.historicalAssets)===hash(after.task.historicalAssets)&&hash(before.predecessors)===hash(after.predecessors),proposedPromptDigest:sha256Bytes(Buffer.from(prompt(after))),limit:'No omission or generic key/shape traversal; unique oversized content still reaches the unchanged guard. Implementation must verify actual successor input too, including retained current candidate in its new history and current authority metadata.'},null,2)+'\n');
console.log(JSON.stringify({current,proposed,headroom:1048576-proposed,saved:current-proposed}));

