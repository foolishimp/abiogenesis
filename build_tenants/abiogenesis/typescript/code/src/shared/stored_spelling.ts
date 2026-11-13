import { realpathSync } from "node:fs";

// The one statement of a path's stored spelling: the path with every symbolic
// link resolved and every component named as the volume stores it, which is
// what the system `realpath` (`realpathSync.native`) returns. The JavaScript
// `realpathSync` resolves links but keeps the letters it is given, so on a
// volume that ignores letter case or Unicode normalization form it returns a
// path in another spelling unchanged. A synchronous canonical-path check asks
// `spelledAsStored`; a planner that resolves an existing ancestor takes
// `storedSpelling`. No letter case or normalization form is folded here: the
// volume answers. Both throw what the system `realpath` throws (`ENOENT` for a
// missing path among them), and each caller keeps its own handling of that.

/** The stored spelling of an existing path. */
export function storedSpelling(path: string): string {
  return realpathSync.native(path);
}

/** True when the path is its own stored spelling, which implies that no
 * component is a symbolic link. */
export function spelledAsStored(path: string): boolean {
  return storedSpelling(path) === path;
}
