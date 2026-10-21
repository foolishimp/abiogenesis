// Import direction for the common library: a module under code/src/shared/
// imports only code/src/shared/ modules and packages. Any relative specifier
// that resolves outside code/src/shared/ is a violation.
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sharedRoot = join(root, "code/src/shared");

// `from "<spec>"` (import and re-export, possibly across lines),
// `import "<spec>"` (side-effect import) and `import("<spec>")` (dynamic or
// inline type import), in either quote style.
const specifierPattern =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])([^"'\n]+)\1/gu;

async function typescriptFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await typescriptFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".ts")) files.push(path);
  }
  return files.sort();
}

const violations = [];
const files = await typescriptFiles(sharedRoot);
for (const file of files) {
  const text = await readFile(file, "utf8");
  const lines = text.split("\n");
  for (const match of text.matchAll(specifierPattern)) {
    const specifier = match[2];
    if (!specifier.startsWith(".")) continue;
    const target = resolve(dirname(file), specifier);
    if (target.startsWith(sharedRoot + sep)) continue;
    const specifierOffset = match.index + match[0].length - specifier.length - 1;
    const line = text.slice(0, specifierOffset).split("\n").length;
    violations.push(
      `${relative(root, file)}:${line}: ${lines[line - 1].trim()}`,
    );
  }
}

for (const violation of violations) console.error(violation);
if (violations.length > 0) {
  console.error(
    `check-import-direction: ${violations.length} upward import(s) from code/src/shared/`,
  );
  process.exit(1);
}
console.log(
  `check-import-direction: ${files.length} modules under code/src/shared/ import only code/src/shared/ and packages`,
);
