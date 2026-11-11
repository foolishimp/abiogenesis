import { isAbsolute, relative, sep } from "node:path";

// The one statement of "is this path inside that root?". It classifies the
// relation `relative(root, candidate)` segment-exactly and answers each question
// with a named predicate over that class. Only a `..` segment is a parent step:
// a first segment that merely begins with two dots (`..x`, `...`) names a
// descendant (T287 W2 R3 C0: a subject is a strict descendant of the canonical
// root; `.` and `..` spellings refuse). It is lexical only: callers resolve,
// realpath and lstat as their own rules require, and pass the paths or the
// relation string they already hold. The separator is the platform's
// (`node:path` `sep`), the one `relative` writes.

/** The class of `relative(root, candidate)`: the root itself, outside it, or inside it. */
export type PathRelation = "same" | "outside" | "inside";

/** `same` for `""`; `outside` for an absolute relation, `..`, or one that
 * begins with `..` and the separator; `inside` otherwise (`..x` and `...` among them). */
export function classifyPathRelation(relation: string): PathRelation {
  if (relation === "") return "same";
  if (isAbsolute(relation) || relation === ".." || relation.startsWith(`..${sep}`)) return "outside";
  return "inside";
}

/** The class of `candidate` against `root`, both resolved lexically. */
export function pathRelation(root: string, candidate: string): PathRelation {
  return classifyPathRelation(relative(root, candidate));
}

/** Within: true for same and inside; false for outside. */
export function pathWithin(relation: PathRelation): boolean {
  return relation !== "outside";
}

/** Strictly within: true for inside; false for same and outside. */
export function pathStrictlyWithin(relation: PathRelation): boolean {
  return relation === "inside";
}
