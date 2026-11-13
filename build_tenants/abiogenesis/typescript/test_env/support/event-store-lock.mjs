import * as store from '../../build/code/src/abg/event_store.js';

// T-292 TD-82: the append lock path of a log comes from the store's one
// owner, durableAppendLockPath in abg/event_store.ts; a test does not build
// it. `owner` is the store module that holds the log: this build's by
// default, or an installed copy's.

/** The lock path of the log with this device and inode. */
export const eventStoreLockPath=({device,inode},owner=store)=>owner.durableAppendLockPath({device,inode});

/** The lock path of the log a file status describes. */
export const eventStoreLockPathOf=(status,owner=store)=>eventStoreLockPath({device:status.dev,inode:status.ino},owner);
