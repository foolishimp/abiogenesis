import {
  isAbsolute,
  relative,
  resolve
} from "node:path";

export function pathIsInside(child: string, parent: string): boolean {
  const resolvedChild = resolve(child);
  const resolvedParent = resolve(parent);
  const relativePath = relative(resolvedParent, resolvedChild);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !isAbsolute(relativePath))
  );
}
