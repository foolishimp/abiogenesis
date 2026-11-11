import { isAbsolute, relative, sep } from "node:path";

// The one statement of "is this path inside that root?". It classifies the
// relation `relative(root, candidate)` and answers each question with a named
// predicate over that class. It is lexical only: callers resolve, realpath and
// lstat as their own rules require, and pass the paths or the relation string
// they already hold. The separator is the platform's (`node:path` `sep`), the
// one `relative` writes.

/** The class of `relative(root, candidate)`: the root itself, outside it, or
 * inside it with or without a first segment that begins with two dots. */
export type PathRelation = "same" | "outside" | "inside_dotted" | "inside";

/** `same` for `""`; `outside` for an absolute relation, `..`, or one that
 * begins with `..` and the separator; `inside_dotted` for any other relation
 * whose first segment begins with `..` (`..x`, `...`); `inside` otherwise. */
export function classifyPathRelation(relation: string): PathRelation {
  if (relation === "") return "same";
  if (isAbsolute(relation) || relation === ".." || relation.startsWith(`..${sep}`)) return "outside";
  return relation.startsWith("..") ? "inside_dotted" : "inside";
}

/** The class of `candidate` against `root`, both resolved lexically. */
export function pathRelation(root: string, candidate: string): PathRelation {
  return classifyPathRelation(relative(root, candidate));
}

/** Within, segment-exact: true for same, inside and inside_dotted; false for outside. */
export function pathWithin(relation: PathRelation): boolean {
  return relation !== "outside";
}

/** Strictly within, segment-exact: true for inside and inside_dotted; false for same and outside. */
export function pathStrictlyWithin(relation: PathRelation): boolean {
  return relation === "inside" || relation === "inside_dotted";
}

/** Confined subject, root admitted: true for same and inside; false for inside_dotted and outside. */
export function pathConfined(relation: PathRelation): boolean {
  return relation === "same" || relation === "inside";
}

/** Confined subject, strictly: true for inside; false for same, inside_dotted and outside. */
export function pathStrictlyConfined(relation: PathRelation): boolean {
  return relation === "inside";
}
