import {readFile,writeFile} from "node:fs/promises";
import {pathToFileURL} from "node:url";
import {createHash} from "node:crypto";
const base="/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01";
const selected=JSON.parse(await readFile("/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-20/selected-core.json","utf8"));
const source=selected.packageRoot+"/build/code/src/";
const {rawAdmitValue}=await import(pathToFileURL(source+"validator/raw_admission.js").href);
const {validatePublication}=await import(pathToFileURL(source+"validator/validation.js").href);
const {sha256Canonical}=await import(pathToFileURL(source+"shared/digests.js").href);
const bytes=await readFile(base+"/bootstrap-preparation-01/calls/06-catalog.jsonl");
const transport=JSON.parse(bytes),publications=transport.invocation.resources.publications;
const report={kind:"pure_catalog_publication_predicate_diagnostic",requestFileSha256:createHash("sha256").update(bytes).digest("hex"),installedRoot:selected.packageRoot,publicationCount:publications.length,rows:[],firstRefusal:null};
for(const [index,p] of publications.entries()){
 const raw=rawAdmitValue(p,"module_publication","contract://abiogenesis/gtl/module-publication@5");
 const contributions=p.contributions.map(c=>rawAdmitValue(c,"catalog_contribution","contract://abiogenesis/gtl/catalog-contribution@5"));
 const refusal=raw.kind!=="raw_admitted_value"?raw:contributions.find(c=>c.kind!=="raw_admitted_value");
 const validation=refusal??validatePublication(raw,contributions);
 const row={index,moduleRef:p.moduleRef,publicationValueDigest:sha256Canonical(p),rawKind:raw.kind,contributionCount:contributions.length,resultKind:validation.kind,disposition:validation.disposition,diagnosticCount:validation.diagnostics?.length??0,diagnostics:validation.diagnostics?.slice(0,12)??[],code:validation.code??null,message:validation.message??null};
 report.rows.push(row);
 if(validation.kind!=="publication_validation"){report.firstRefusal=row;break;}
}
await writeFile(new URL("predicate-probe.json",import.meta.url),JSON.stringify(report,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(report,null,2));
