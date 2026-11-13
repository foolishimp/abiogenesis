import { lstatSync, readFileSync, readdirSync, readlinkSync, type Dirent, type Stats } from "node:fs";
import { lstat, readFile, readdir, readlink, realpath } from "node:fs/promises";
import { resolve } from "node:path";

import { compareUnicodeCodeUnits } from "../shared/canonical_json.js";
import { sha256Bytes, type Sha256Digest } from "../shared/digests.js";
import { storedSpelling } from "../shared/stored_spelling.js";

// One recursive walk over a filesystem tree. The C2 Worker and the file replace
// walk an installed Product root before and after their effect and record its
// entries as they are; the command helper walks the Product root and its
// sandbox and derives its own path observations. Each site keeps its own
// refusal text and calling convention. The C2 Worker and the file replace use
// the walk's root rule and the helper its own; each takes the root's stored
// spelling from the system `realpath`, so the three give one verdict on one
// root. This module imports no ABG module, so the helper's start-up graph
// stays small.

/** @internal One walked entry: the path relative to the root with `/`
 * separators; the kind `lstat` reports (a symlink is recorded with its target
 * text, never followed); the digest of a file's bytes, a symlink's target text
 * or the word `directory`; and `device:inode:links` as the file identity. */
export type TreeEntry = {
  readonly relativePath: string;
  readonly nodeKind: "directory" | "file" | "symlink";
  readonly symlinkTarget: string | null;
  readonly byteLength: number | null;
  readonly digest: Sha256Digest;
  readonly fileIdentity: string;
};

/** @internal A site's refusal texts. With `rootRefusal`, the root must equal
 * its resolved form and be a concrete directory that the system `realpath`
 * returns unchanged, so it is spelled as the volume stores its names; without
 * it, the caller has admitted the root. `specialNodeRefusal` is thrown at the
 * first entry that is not a symlink, directory or file. */
export type TreeWalkRefusals = {
  readonly rootRefusal?: string;
  readonly specialNodeRefusal: string;
};

type WalkStep = { readonly call: "lstat" | "readdir" | "readlink" | "readFile" | "realpath"; readonly path: string };

const DIRECTORY_DIGEST = sha256Bytes(Buffer.from("directory", "utf8"));

// The walk yields each filesystem call and receives its result, so both
// drivers make the same calls in the same order. Entries are visited in
// code-unit order of their names, which no locale changes; a directory
// precedes its children.
function* walk(rootValue: string, refusals: TreeWalkRefusals, entries: TreeEntry[]): Generator<WalkStep, void, unknown> {
  const root = resolve(rootValue);
  if (refusals.rootRefusal !== undefined) {
    const status = (yield { call: "lstat", path: root }) as Stats;
    if (root !== rootValue || status.isSymbolicLink() || !status.isDirectory() ||
      (yield { call: "realpath", path: root }) !== root) {
      throw new TypeError(refusals.rootRefusal);
    }
  }
  yield* visit(root, "", refusals, entries);
}

function* visit(directory: string, relativeDirectory: string, refusals: TreeWalkRefusals,
  entries: TreeEntry[]): Generator<WalkStep, void, unknown> {
  const listed = (yield { call: "readdir", path: directory }) as Dirent[];
  listed.sort((left, right) => compareUnicodeCodeUnits(left.name, right.name));
  for (const entry of listed) {
    const relativePath = relativeDirectory.length === 0 ? entry.name : `${relativeDirectory}/${entry.name}`;
    const path = resolve(directory, entry.name);
    const status = (yield { call: "lstat", path }) as Stats;
    const fileIdentity = `${status.dev}:${status.ino}:${status.nlink}`;
    if (status.isSymbolicLink()) {
      const target = (yield { call: "readlink", path }) as string;
      entries.push({ relativePath, nodeKind: "symlink", symlinkTarget: target, byteLength: null,
        digest: sha256Bytes(Buffer.from(target, "utf8")), fileIdentity });
    } else if (status.isDirectory()) {
      entries.push({ relativePath, nodeKind: "directory", symlinkTarget: null, byteLength: null,
        digest: DIRECTORY_DIGEST, fileIdentity });
      yield* visit(path, relativePath, refusals, entries);
    } else if (status.isFile()) {
      const bytes = (yield { call: "readFile", path }) as Buffer;
      entries.push({ relativePath, nodeKind: "file", symlinkTarget: null, byteLength: bytes.byteLength,
        digest: sha256Bytes(bytes), fileIdentity });
    } else {
      throw new TypeError(refusals.specialNodeRefusal);
    }
  }
}

function callSync(step: WalkStep): unknown {
  switch (step.call) {
    case "lstat": return lstatSync(step.path);
    case "readdir": return readdirSync(step.path, { withFileTypes: true });
    case "readlink": return readlinkSync(step.path);
    case "readFile": return readFileSync(step.path);
    case "realpath": return storedSpelling(step.path);
  }
}

function callAsync(step: WalkStep): Promise<unknown> {
  switch (step.call) {
    case "lstat": return lstat(step.path);
    case "readdir": return readdir(step.path, { withFileTypes: true });
    case "readlink": return readlink(step.path);
    case "readFile": return readFile(step.path);
    case "realpath": return realpath(step.path);
  }
}

/** @internal Walk a tree with synchronous filesystem calls. */
export function walkTreeSync(root: string, refusals: TreeWalkRefusals): readonly TreeEntry[] {
  const entries: TreeEntry[] = [];
  const steps = walk(root, refusals, entries);
  let step = steps.next();
  while (!step.done) step = steps.next(callSync(step.value));
  return entries;
}

/** @internal Walk a tree with asynchronous filesystem calls, one awaited call at a time. */
export async function walkTree(root: string, refusals: TreeWalkRefusals): Promise<readonly TreeEntry[]> {
  const entries: TreeEntry[] = [];
  const steps = walk(root, refusals, entries);
  let step = steps.next();
  while (!step.done) step = steps.next(await callAsync(step.value));
  return entries;
}
