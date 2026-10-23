import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {reopenEventStore,closeHeldEventStoreAtDurablePrefix} from '../../../build/code/src/abg/event_store.js';
import {sha256Canonical} from '../../../build/code/src/shared/digests.js';

// Byte-for-byte copies of two files of the S01 Hello store,
// .ai-workspace/comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/attempt-01/
// call-11.jsonl (9,304 bytes, sha256 3d4adcf6…f845) and events-01/runtime.events.jsonl
// (2,797,774 bytes, sha256 d2a677a2…e56c). The close handoff in call-11.jsonl is
// historical evidence: its storeIdentity and eventLogRef name the original file
// and are never compared with this copy.
export const storeRoot=path.join(import.meta.dirname,'s01-attempt-01');
export const eventLogPath=path.join(storeRoot,'events-01/runtime.events.jsonl');
export const historical=JSON.parse(fs.readFileSync(path.join(storeRoot,'call-11.jsonl'),'utf8')).acquisition.closeHandoff;

// The store owner reopens the packaged log under an authority built from the
// file itself (path, device, inode, length, sha256) and the selected event
// profile, then closes it with no append. The close handoff's coordinate is cold:
// later reads authenticate the physical file again. A refusal is returned as is.
export function reopenPackagedS01Store(eventContractDigest) {
  const bytes=fs.readFileSync(eventLogPath),stat=fs.statSync(eventLogPath);
  const body={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath,device:stat.dev,inode:stat.ino,
    eventLogDigest:'sha256:'+createHash('sha256').update(bytes).digest('hex'),durableByteLength:bytes.length,eventContractDigest};
  const opened=reopenEventStore({...body,authorityDigest:sha256Canonical(body)});
  if(opened.kind!=='reopened_event_store_context')return opened;
  return closeHeldEventStoreAtDurablePrefix(opened.store,opened.prefix);
}
