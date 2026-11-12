// T-292 TD-32: the current event profile W is computed from the current table
// and is not pinned in source, so an edit to that table would silently make
// every W-stamped log unreadable (L, RC6 and S2 refuse at load instead). This
// lane pins W's digest and reference as they were at e9d870c02; 26 recorded logs
// under the evidence root carry that stamp.
import assert from 'node:assert/strict';
import test from 'node:test';
import {ROOT_EVENT_CONTRACT_DESCRIPTOR,ROOT_EVENT_CONTRACT_DIGEST,rootEventContractProfile} from '../../build/code/src/abg/event_store.js';
import {ROOT_WINDOW_EVENT_PROFILE_REF} from '../../build/code/src/abg/event_contract_profiles.js';

const W={digest:'sha256:51299706fecc4485b039a4169e7b50b30dc04c447fb5cbf3f7366c9caef782cf',
  profileRef:'abg.event-contract.root/p6-stdout-window-witness@1'};
const ACTION='The current event-contract table changed, so logs stamped with the present W profile would no longer load. '+
  'Before changing the current table, retain the present table as a pinned, selectable profile '+
  '(a hard-pinned entry of constructRootEventContractProfiles in abg/event_contract_profiles.ts, as installed_rc6 and frozen_s2 are), '+
  'then move this pin to the new current profile.';

test('the current event profile keeps the digest and reference its recorded logs carry',()=>{
  assert.equal(ROOT_EVENT_CONTRACT_DIGEST,W.digest,ACTION);
  assert.equal(ROOT_WINDOW_EVENT_PROFILE_REF,W.profileRef,ACTION);
  assert.equal(ROOT_EVENT_CONTRACT_DESCRIPTOR.profileRef,W.profileRef,ACTION);
  const current=rootEventContractProfile(W.digest);
  assert.equal(current?.current,true,ACTION);
  assert.equal(current?.profileRef,W.profileRef,ACTION);
});
