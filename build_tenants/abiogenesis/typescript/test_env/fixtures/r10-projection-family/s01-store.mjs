import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {reopenEventStore,closeHeldEventStoreAtDurablePrefix} from '../../../build/code/src/abg/event_store.js';
import {sha256Canonical} from '../../../build/code/src/shared/digests.js';
import {evidenceInput} from '../../support/evidence-root.mjs';

// Two files of the S01 Hello store are historical evidence under
// ABI5_EVIDENCE_ROOT, read by path, sha256 and bytes (TD-19): call-11.jsonl and
// events-01/runtime.events.jsonl. Without the root s01Skip names them and the
// cases that read the store skip. The close handoff in call-11.jsonl is
// historical evidence: its storeIdentity and eventLogRef name the original file
// and are never compared with the copy below.
const S01='comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/attempt-01/';
export const callInput=evidenceInput({path:S01+'call-11.jsonl',sha256:'3d4adcf616337360931993fbd10e42090c989ac24060d56318cd21ea9363f845',bytes:9304});
export const eventsInput=evidenceInput({path:S01+'events-01/runtime.events.jsonl',sha256:'d2a677a2201dddb5b6f14d82b1c11e5d3cf95e9d369c30742cd750dac198e56c',bytes:2797774});
export const s01Skip=(callInput.kind==='absent'&&callInput.reason)||(eventsInput.kind==='absent'&&eventsInput.reason);
export const historical=s01Skip?null:JSON.parse(callInput.bytes.toString('utf8')).acquisition.closeHandoff;

// The store owner never opens the file under the root. The log's bytes are
// written to a per-process scratch directory with the store's layout, removed
// at exit; that copy is what the owner reopens.
export const storeRoot=s01Skip?null:fs.mkdtempSync(path.join(os.tmpdir(),'abi5-s01-store-'));
export const eventLogPath=storeRoot&&path.join(storeRoot,'events-01/runtime.events.jsonl');
if(storeRoot){
  fs.mkdirSync(path.dirname(eventLogPath));fs.writeFileSync(eventLogPath,eventsInput.bytes);
  process.once('exit',()=>fs.rmSync(storeRoot,{recursive:true,force:true}));
}

// The store owner reopens the scratch log under an authority built from the
// file itself (path, device, inode, length, sha256) and the selected event
// profile, then closes it with no append. The close handoff's coordinate is cold:
// later reads authenticate the physical file again. A refusal is returned as is.
export function reopenPackagedS01Store(eventContractDigest) {
  if(s01Skip)throw new Error(s01Skip);
  const bytes=fs.readFileSync(eventLogPath),stat=fs.statSync(eventLogPath);
  const body={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath,device:stat.dev,inode:stat.ino,
    eventLogDigest:'sha256:'+createHash('sha256').update(bytes).digest('hex'),durableByteLength:bytes.length,eventContractDigest};
  const opened=reopenEventStore({...body,authorityDigest:sha256Canonical(body)});
  if(opened.kind!=='reopened_event_store_context')return opened;
  return closeHeldEventStoreAtDurablePrefix(opened.store,opened.prefix);
}
