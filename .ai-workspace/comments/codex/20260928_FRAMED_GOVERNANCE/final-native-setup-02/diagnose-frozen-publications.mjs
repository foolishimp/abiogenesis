import fs from 'node:fs/promises';import {join} from 'node:path';import {loadRuntime} from './public-support.mjs';
const here=import.meta.dirname,read=async n=>JSON.parse(await fs.readFile(join(here,n),'utf8'));
const identity=await read('selected-core.json'),call=await read('pre-effect-catalog-call.json'),{validator}=await loadRuntime(identity.installedRoot);
const rows=[];
for(const publication of call.resources.publications){
 const raw=validator.rawAdmitValue(publication,'module_publication','contract://abiogenesis/gtl/module-publication@5');
 const contributions=publication.contributions.map(c=>validator.rawAdmitValue(c,'catalog_contribution','contract://abiogenesis/gtl/catalog-contribution@5'));
 const rawContributionRefusal=contributions.find(c=>c.kind!=='raw_admitted_value');
 const result=raw.kind!=='raw_admitted_value'?raw:rawContributionRefusal??validator.validatePublication(raw,contributions);
 rows.push({moduleRef:publication.moduleRef,rawKind:raw.kind,contributionCount:contributions.length,result});
 if(result.kind!=='publication_validation')break;
}
const evidence={classification:'read-only installed pure validator diagnosis of exact failed-call bytes; no new Public call or resource acquisition',input:'pre-effect-catalog-call.json',rows};
await fs.writeFile(join(here,'pure-refusal-diagnosis.json'),JSON.stringify(evidence,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(evidence));
