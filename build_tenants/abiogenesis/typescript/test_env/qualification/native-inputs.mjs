// The declared native build inputs (scripts/native-build-inputs.json) as rows of the existing recipe auxiliary
// carrier ({relativePath, digest, byteCount}), and the single declared acquisition source of every auxiliary row
// the preparation places. npm rows keep the npm-only dependencies.json contract (archives by file name from the
// supplied dependency directory); native rows sit at their exact protected placement
// (scripts/native-build/protected-inputs.mjs) and are acquired from their declared host path only after their
// bytes verify. In the bound worksite those protected copies, never the host paths, are what the recipe's
// `build-native.mjs --protected-inputs` command consumes.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { placementCollisions, protectedPlacementRows, readNativeBuildInputs } from '../../scripts/native-build/protected-inputs.mjs';

export { placementCollisions } from '../../scripts/native-build/protected-inputs.mjs';
export const DEPENDENCIES_PATH = 'test_env/qualification/recipe/dependencies.json';
const TENANT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sha256Hex = bytes => createHash('sha256').update(bytes).digest('hex');

/** The protected placement rows of the declared native inputs, relative to the worksite (the recipe root). */
export async function nativePlacement(tenantRoot = TENANT) {
  const inputs = await readNativeBuildInputs(tenantRoot);
  return { inputs, root: inputs.protectedPlacement.root,
    rows: protectedPlacementRows(inputs).map(row => ({ ...row, worksitePath: inputs.protectedPlacement.root + '/' + row.relativePath })) };
}

/**
 * One recipe auxiliary row per declared native input, with the declared digest and the inspected byte count.
 * Missing or changed host bytes refuse; they are never replaced by another location.
 */
export async function nativeAuxiliaryInputs(tenantRoot = TENANT) {
  const { rows } = await nativePlacement(tenantRoot), auxiliary = [], failures = [];
  for (const row of rows) {
    try {
      const bytes = await readFile(row.hostPath), actual = sha256Hex(bytes);
      if (actual !== row.sha256) failures.push(`${row.hostPath}: sha256 ${actual} != ${row.sha256}`);
      else auxiliary.push({ relativePath: row.worksitePath, digest: 'sha256:' + actual, byteCount: bytes.length });
    } catch (error) {
      failures.push(`${row.hostPath}: ${error.code ?? String(error)}`);
    }
  }
  if (failures.length > 0) throw new TypeError('declared native inputs changed or missing: ' + failures.join('; '));
  return auxiliary;
}

/**
 * The acquisition source of each auxiliary row: exactly one of the npm dependency archive (by its file name in
 * dependencyRoot) or the declared native host path. Rows declared by neither or both, and npm archives sharing a
 * file name, refuse.
 */
export async function recipeAuxiliarySources({ dependencyRoot, tenantRoot = TENANT }) {
  if (typeof dependencyRoot !== 'string' || !isAbsolute(dependencyRoot)) throw new TypeError('dependency directory must be one absolute path');
  const dependencies = JSON.parse(await readFile(join(tenantRoot, DEPENDENCIES_PATH), 'utf8'));
  if (dependencies?.kind !== 'qualification_recipe_dependencies' || !Array.isArray(dependencies.dependencies))
    throw new TypeError('dependencies.json is not the recipe dependency declaration');
  const npm = new Map(), names = new Set();
  for (const row of dependencies.dependencies) {
    const name = basename(row.path);
    if (names.has(name)) throw new TypeError('dependency archives share one file name: ' + name);
    names.add(name); npm.set(row.path, join(dependencyRoot, name));
  }
  const { root, rows } = await nativePlacement(tenantRoot);
  const native = new Map(rows.map(row => [row.worksitePath, row.hostPath]));
  return Object.freeze({ npm: npm.size, native: native.size, nativeRoot: root,
    sourceOf(row) {
      const archive = npm.get(row.relativePath), host = native.get(row.relativePath);
      if ((archive === undefined) === (host === undefined)) throw new TypeError('auxiliary input has no single declared source: ' + row.relativePath);
      return archive ?? host;
    } });
}
