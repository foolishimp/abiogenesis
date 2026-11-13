import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// Controlled non-POSIX branch, not native Windows qualification. Each real
// subprocess lacks getuid and receives the same OS-account-home result. Its
// temporary and home environment variables deliberately disagree with that
// result. No Product store, filesystem operation or recovery result is doubled.
const DRIVER = String.raw`
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import {syncBuiltinESMExports} from 'node:module';
import {spawnSync} from 'node:child_process';
import {join, dirname} from 'node:path';
const [moduleUrl, root, mode, authorityText] = process.argv.slice(2);
const accountHome = join(root, 'os-account-home');
process.getuid = undefined;
os.userInfo = () => {
  if (mode === 'lookup-failure') throw Error('selected OS account unavailable');
  return {homedir: accountHome, username: 'controlled-account', uid: -1, gid: -1, shell: null};
};
syncBuiltinESMExports();
const S = await import(moduleUrl);
const {sha256Canonical, sha256Bytes} = await import(new URL('../shared/digests.js', moduleUrl));
const candidate = n => ({kind:'public_operation_admitted',eventTime:'2026-11-13T00:00:00.000Z',
  aggregateType:'workspace',aggregateId:'invocation://td82/'+n,parentAggregateId:null,
  causationEventRefs:[],correlationId:'correlation://td82/'+n,workflowVersion:'5.0.0',
  scopeClass:'workspace',basisId:'basis://td82',payload:{invocationDigest:sha256Canonical(n),
  invocationRef:'invocation://td82/'+n,operationId:'abg.operation.project.read',variant:'status'}});
if (mode === 'try' || mode === 'abandon') {
  const opened = S.reopenEventStore(JSON.parse(authorityText));
  if (opened.kind !== 'reopened_event_store_context') {
    console.log(JSON.stringify(opened));
  } else {
    const ordinal = S.admitRuntimeEvent(opened.store, candidate(mode)).admissionOrdinal;
    if (mode === 'abandon') {
      process.stdout.write(JSON.stringify({ordinal,pid:process.pid}), () => process.kill(process.pid, 'SIGKILL'));
    } else {
      console.log(JSON.stringify({ordinal,handoff:opened.store.projectReopenAuthorityAndClose()}));
    }
  }
} else {
  fs.mkdirSync(accountHome);
  if (mode === 'directory-failure') fs.writeFileSync(join(accountHome,'.abiogenesis-event-store-locks-v5'),'not a directory');
  const path = join(root,'events.jsonl');
  const acquired = S.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});
  if (mode.endsWith('-failure')) {
    assert.equal(acquired.code,'sink_unavailable',JSON.stringify(acquired));
    assert.equal(fs.existsSync(path),false,'failed acquisition leaves no created log');
    assert.equal(fs.existsSync(join(os.tmpdir(),'abiogenesis-event-store-locks-v5')),false,'no temporary fallback');
    console.log(JSON.stringify({mode,code:acquired.code}));
  } else {
    assert.ok('store' in acquired,JSON.stringify(acquired));
    S.admitRuntimeEvent(acquired.store,candidate('seed'));
    const seed = acquired.store.projectReopenAuthorityAndClose();
    const physical = fs.statSync(path);
    const lockPath = S.durableAppendLockPath({device:physical.dev,inode:physical.ino});
    assert.equal(lockPath,join(accountHome,'.abiogenesis-event-store-locks-v5',physical.dev+'-'+physical.ino+'.lock'));
    const childEnv = {...process.env};
    for (const key of ['TMPDIR','TMP','TEMP','HOME','USERPROFILE']) {
      childEnv[key] = join(root,'child-'+key); fs.mkdirSync(childEnv[key]);
    }
    const runChild = (childMode,authority) => spawnSync(process.execPath,
      [process.argv[1],moduleUrl,root,childMode,JSON.stringify(authority)],
      {env:childEnv,encoding:'utf8',timeout:20000});
    const held = S.reopenEventStore(seed.reopenAuthority);
    assert.equal(held.kind,'reopened_event_store_context');
    const before = fs.readFileSync(path);
    const contender = runChild('try',seed.reopenAuthority);
    assert.equal(contender.status,0,contender.stderr);
    const refused = JSON.parse(contender.stdout);
    assert.equal(refused.code,'sink_unavailable',contender.stdout);
    assert.match(refused.message,/already has an exclusive append lock/);
    assert.deepEqual(fs.readFileSync(path),before);
    assert.equal(S.admitRuntimeEvent(held.store,candidate('holder')).admissionOrdinal,2);
    const handoff = held.store.projectReopenAuthorityAndClose();
    const child = runChild('abandon',handoff.reopenAuthority);
    assert.equal(child.signal,'SIGKILL',child.stderr);
    const {ordinal,pid} = JSON.parse(child.stdout); assert.equal(ordinal,3);
    const lock = fs.statSync(lockPath), lockBytes = fs.readFileSync(lockPath), bytes = fs.readFileSync(path);
    const recovery = S.recoverInterruptedEventStore({lastCloseHandoff:handoff,
      expectedCurrent:{byteLength:bytes.length,digest:sha256Bytes(bytes)},ownerPid:pid,
      abandonedLock:{path:lockPath,device:lock.dev,inode:lock.ino,
        bytesBase64:lockBytes.toString('base64'),digest:sha256Bytes(lockBytes)}});
    assert.equal(recovery.kind,'recovered',JSON.stringify(recovery));
    assert.equal(recovery.validatedEventCount,3); assert.deepEqual(fs.readFileSync(path),bytes);
    assert.equal(fs.existsSync(lockPath),false);
    const legacy = join(os.tmpdir(),'abiogenesis-event-store-locks-v5',physical.dev+'-'+physical.ino+'.lock');
    fs.mkdirSync(dirname(legacy)); fs.writeFileSync(legacy,'unresolved earlier-build ownership');
    const legacyRefused = S.reopenEventStore(recovery.closeHandoff.reopenAuthority);
    assert.equal(legacyRefused.code,'sink_unavailable',JSON.stringify(legacyRefused));
    assert.match(legacyRefused.message,/already has an exclusive append lock/);
    assert.equal(fs.existsSync(lockPath),false,'legacy refusal releases only its own acquisition');
    fs.unlinkSync(legacy);
    const reopened = S.reopenEventStore(recovery.closeHandoff.reopenAuthority);
    assert.equal(reopened.kind,'reopened_event_store_context',JSON.stringify(reopened));
    assert.equal(S.admitRuntimeEvent(reopened.store,candidate('recovered')).admissionOrdinal,4);
    reopened.store.closeDurableLog();
    const ordinals = fs.readFileSync(path,'utf8').trimEnd().split('\n').map(row=>JSON.parse(row).admissionOrdinal);
    assert.deepEqual(ordinals,[1,2,3,4]); assert.equal(fs.existsSync(lockPath),false);
    console.log(JSON.stringify({mode,ordinals,contender:refused.code,recovery:recovery.kind,legacy:legacyRefused.code}));
  }
}
`;

for (const mode of ['exercise','lookup-failure','directory-failure']) {
  test(`TD-82 non-POSIX namespace branch: ${mode}`, t => {
    const root = fs.mkdtempSync(join(tmpdir(),'td82-user-home-'));
    t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
    const driverPath = join(root,'driver.mjs'); fs.writeFileSync(driverPath,DRIVER);
    const env = {...process.env};
    for (const key of ['TMPDIR','TMP','TEMP','HOME','USERPROFILE']) {
      env[key] = join(root,'parent-'+key); fs.mkdirSync(env[key]);
    }
    const result = spawnSync(process.execPath,[driverPath,
      new URL('../../build/code/src/abg/event_store.js',import.meta.url).href,root,mode],
      {env,encoding:'utf8',timeout:30000});
    assert.equal(result.status,0,result.stderr || String(result.error));
    assert.equal(JSON.parse(result.stdout).mode,mode);
  });
}
