import {readFile,writeFile} from 'node:fs/promises';
import {readPinnedJson} from 'file:///Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/support/retained-installed-consumer.mjs';
import {selectQualificationTaskDependencyClosure} from 'file:///Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/scripts/prepare-retained-setup-binding.mjs';
const path=process.env.ABI5_RETAINED_CONSUMER_CONFIG;
const cfg=JSON.parse(await readFile(path,'utf8')),ledger=[];
const packet=await readPinnedJson(cfg.originalPacket,ledger);
const manifest=await readPinnedJson(cfg.originalManifest,ledger);
const closure=selectQualificationTaskDependencyClosure(packet.assessmentInput,manifest);
const result={...closure.report,selectedEntrySerializedBytes:Buffer.byteLength(JSON.stringify(closure.entries)),
 necessaryOriginalColdReads:ledger,standing:'pure selection preflight; canonical owner acquisition has not run'};
await writeFile(new URL('./closure-preflight.json',import.meta.url),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({selectedEntryCount:result.selectedEntryCount,selectedMaterialCount:result.selectedMaterialCount,
 selectedMaterialDecodedBytes:result.selectedMaterialDecodedBytes,allRequiredRecordMaterialDecodedBytes:result.allRequiredRecordMaterialDecodedBytes,
 completeInventoryMemberCount:result.completeInventoryMemberCount,selectedEntrySerializedBytes:result.selectedEntrySerializedBytes}));
