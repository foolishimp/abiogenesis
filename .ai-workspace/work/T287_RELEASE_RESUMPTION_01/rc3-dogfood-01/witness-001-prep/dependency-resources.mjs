// Operator-side coordinate mapping only: no grant, Product selector or lookup.
import { realpath, stat } from 'node:fs/promises';
import { isAbsolute } from 'node:path';

export async function resolveDependencyResources(declaration, mappings) {
  if (!Array.isArray(declaration?.dependencies) || !Array.isArray(mappings))
    throw new TypeError('An explicit mapping for each declared dependency is required');
  const expected = declaration.dependencies.map(row => row?.dependencyRef);
  if (expected.some(ref => typeof ref !== 'string' || !ref) || new Set(expected).size !== expected.length)
    throw new TypeError('Declared dependency references must be distinct');
  const supplied = new Map();
  for (const row of mappings) {
    if (!row || Object.keys(row).sort().join(',') !== 'dependencyRef,recordPath,root' ||
        typeof row.dependencyRef !== 'string' || !expected.includes(row.dependencyRef) || supplied.has(row.dependencyRef) ||
        typeof row.root !== 'string' || !isAbsolute(row.root) || typeof row.recordPath !== 'string' || !isAbsolute(row.recordPath))
      throw new TypeError('Dependency mapping is malformed, duplicated or not declared');
    supplied.set(row.dependencyRef, row);
  }
  if (supplied.size !== expected.length) throw new TypeError('A declared dependency has no explicit resource mapping');
  return Promise.all(expected.map(async dependencyRef => {
    const row = supplied.get(dependencyRef), root = await realpath(row.root), recordPath = await realpath(row.recordPath);
    if (!(await stat(root)).isDirectory() || !(await stat(recordPath)).isFile())
      throw new TypeError('Dependency resource root and record must be a directory and file');
    return { dependencyRef, root, recordPath };
  }));
}
