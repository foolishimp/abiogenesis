import { readFileSync, writeFileSync, existsSync, lstatSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { resolveNativeDeclarationClosures, nativeDeclarationRoots } from "/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/build/code/src/product/declaration_exports.js";
import { payloadInventoryDigest, sha256Bytes, sha256Canonical } from "/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/build/code/src/shared/digests.js";
import { canonicalJson } from "/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/build/code/src/shared/canonical_json.js";
const phase=dirname(fileURLToPath(import.meta.url));
const root="/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript";
const base="/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02";
const identity=JSON.parse(readFileSync(join(base,"candidate-25/identity.json"),"utf8"));
const archive=identity.archive;
const members=JSON.parse(execFileSync("python3",["-c",`import sys,json,tarfile,io,hashlib
b=open(sys.argv[1],"rb").read()
assert hashlib.sha256(b).hexdigest()==sys.argv[2] and len(b)==int(sys.argv[3]),"archive identity changed"
rows=[]
with tarfile.open(fileobj=io.BytesIO(b),mode="r|gz") as tar:
 for m in tar:
  assert m.isfile() and m.name.startswith("package/"),"unexpected packed member"
  rows.append({"path":m.name[8:],"type":"file","mode":m.mode,"bytes":m.size})
print(json.dumps(rows))`,archive.path,archive.sha256,String(archive.byteCount)],{encoding:"utf8",maxBuffer:8*1024*1024}));
if(members.length!==5265||new Set(members.map(m=>m.path)).size!==5265)throw new Error("packed member population changed");
writeFileSync(join(phase,"packed-population.json"),JSON.stringify({archive,members},null,2)+"\n");
const excluded=new Set(["product-toolchain-manifest.json","contracts/capabilities/capability-definition-graph.json"]);
const payload=members.map(m=>m.path).filter(n=>!excluded.has(n)).sort();
if(payload.length!==5263)throw new Error("payload membership changed");
const declarationSources=[],packageMetadataSources=[],inputPins=[],inventory=[],overlays=[];
const pin=(file,bytes)=>({path:file,sha256:createHash("sha256").update(bytes).digest("hex"),bytes:bytes.length});
for(const name of payload){
 if(name.startsWith("/")||name.split("/").includes(".."))throw new Error("unsafe packed path");
 const compiled=name.startsWith("build/code/src/")?join(phase,"emitted",name.slice(6)):null;
 const selected=compiled!==null&&existsSync(compiled)?compiled:join(root,name);
 const stat=lstatSync(selected);if(!stat.isFile()||stat.isSymbolicLink())throw new Error("non-file selected member");
 const bytes=readFileSync(selected);inventory.push({path:name,sha256:sha256Bytes(bytes)});
 if(selected!==join(root,name))overlays.push({member:name,source:pin(selected,bytes)});
 if(/\.d\.(?:c|m)?ts$/u.test(name)){declarationSources.push({path:name,bytes});inputPins.push({member:name,kind:"declaration",...pin(selected,bytes)});}
 if(name==="package.json"||name.endsWith("/package.json")){packageMetadataSources.push({path:name,bytes});inputPins.push({member:name,kind:"metadata",...pin(selected,bytes)});}
}
const pkg=JSON.parse(readFileSync(join(root,"package.json"),"utf8"));
const sourceProductContentDigest=payloadInventoryDigest(inventory);
writeFileSync(join(phase,"closure-input-pins.json"),JSON.stringify({basis:"exact candidate25 member population; current physical payload with isolated151 emission overlay; NOT a newly built/packed/verified Product",sourceProductContentDigest,declarationCount:declarationSources.length,metadataCount:packageMetadataSources.length,overlayCount:overlays.length,payloadRows:inventory,inputPins,overlays},null,2)+"\n");
const privateTargets=["build/code/src/product/run_invocation_operation.d.ts","build/code/src/abg/invocation_admission.d.ts"];
for(const name of privateTargets){const text=new TextDecoder().decode(declarationSources.find(s=>s.path===name).bytes);if(text.includes("GovernanceCoveredSourceUse")||text.includes("currentSourceUse")||text.includes("sourceUseDeclarations"))throw new Error("private field/import remains in selected declaration");}
const request={packageName:pkg.name,packageType:pkg.type==="module"?"module":"commonjs",packageExports:pkg.exports,declarationSources,packageMetadataSources,sourceProductContentDigest};
const started=new Date().toISOString();const before=performance.now();
const result=await resolveNativeDeclarationClosures(request);const wallMs=performance.now()-before;
const owner="/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/build/code/src/product/declaration_exports.js";
const receipt={kind:"unchanged_canonical_native_declaration_closure",started,finished:new Date().toISOString(),wallMs,owner:pin(owner,readFileSync(owner)),archive,completePackedMembers:members.length,payloadCount:payload.length,sourceProductContentDigest,sourceProductContentDigestMeaning:"canonical digest of isolated151 payload overlay, not a published Product",declarationCount:declarationSources.length,metadataCount:packageMetadataSources.length,overlayCount:overlays.length,requestedRoots:nativeDeclarationRoots(pkg.exports),succeeded:result!==null,closureCount:result?.length??0,resultDigest:result===null?null:sha256Canonical(result),closures:result?.map(c=>({packageExportPath:c.packageExportPath,declarationPath:c.declarationPath,exportedSymbolCount:c.exportedSymbols.length,declarationCount:c.declarationInventory.length,physicalRelationCount:c.physicalRelations.length}))??[],canonicalGeneratedWrites:false,normalBuild:false,packageVerification:false,nativeModelEffects:false};
if(result!==null)writeFileSync(join(phase,"closure-result.json"),canonicalJson(result)+"\n");
writeFileSync(join(phase,"commands/native-declaration-closure.result.json"),JSON.stringify(receipt,null,2)+"\n");
console.log(JSON.stringify(receipt,null,2));if(result===null)process.exit(1);
