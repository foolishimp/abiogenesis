// Validates: T-266 source-blind public API and private witness authority.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const tenantRoot = path.resolve(import.meta.dirname, "../..");

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024
  });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  return result.stdout;
}

test("T-266 packed M01 exports constructors but no nameable private authority", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t266-packed-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const packRoot = path.join(root, "pack");
  const consumerRoot = path.join(root, "consumer");
  await mkdir(packRoot, { recursive: true });
  await mkdir(consumerRoot, { recursive: true });

  const packed = JSON.parse(
    run("npm", ["pack", "--json", "--pack-destination", packRoot], tenantRoot)
  );
  assert.equal(packed.length, 1);
  const tarballPath = path.join(packRoot, packed[0].filename);
  await writeFile(
    path.join(consumerRoot, "package.json"),
    JSON.stringify({ name: "t266-packed-consumer", private: true, type: "module" })
  );
  run(
    "npm",
    [
      "install",
      "--save-exact",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      tarballPath
    ],
    consumerRoot
  );

  await writeFile(
    path.join(consumerRoot, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        target: "ES2022",
        module: "NodeNext",
        moduleResolution: "NodeNext"
      },
      include: ["consumer.ts"]
    })
  );
  await writeFile(
    path.join(consumerRoot, "consumer.ts"),
    `import {
  C,
  cInterfaceCarrier,
  typedInterface,
  typedNode,
  type Node,
  type TypedScalarNode
} from "@abiogenesis/typescript-tenant/gtl/m01";

// @ts-expect-error private witness authority is not a package export.
import { TYPED_NODE_AUTHORITY } from "@abiogenesis/typescript-tenant/gtl/m01";
// @ts-expect-error private C authority is not a package export.
import { NODE_BACKED_C_AUTHORITY } from "@abiogenesis/typescript-tenant/gtl/m01";
// @ts-expect-error the raw fan-in constructor is not public authoring API.
import { constructFanInGraphFunction } from "@abiogenesis/typescript-tenant/gtl/m01";

interface LabObservation { readonly sample: string }
declare const node: Node;
const witness = typedNode({
  node,
  decode: (_raw: unknown): LabObservation => ({ sample: "" })
});
const boundary = typedInterface(witness);
const carrier = cInterfaceCarrier(boundary);
C.of({
  input: carrier,
  output: carrier,
  stageRole: "transform",
  fibre: "F_D",
  armId: "arm://t266/packed-consumer",
  resultBearing: true
});

// @ts-expect-error a public structural literal cannot mint the private brand.
const forged: TypedScalarNode<LabObservation> = {
  kind: "typed_node",
  node,
  nodeRef: node.id,
  nodeContractKey: "forged",
  nodeContractDigest: "sha256:forged"
};
void forged;
void TYPED_NODE_AUTHORITY;
void NODE_BACKED_C_AUTHORITY;
void constructFanInGraphFunction;
`
  );

  const tscBin = path.join(tenantRoot, "node_modules/typescript/bin/tsc");
  run(process.execPath, [tscBin, "-p", "tsconfig.json"], consumerRoot);

  const installedRoot = path.join(
    consumerRoot,
    "node_modules/@abiogenesis/typescript-tenant"
  );
  const declaration = await readFile(
    path.join(
      installedRoot,
      "build/semantic/code/src/gtl/m01/algebra/index.d.ts"
    ),
    "utf8"
  );
  assert.match(declaration, /typedNode/u);
  assert.doesNotMatch(declaration, /TYPED_NODE_AUTHORITY/u);
  assert.doesNotMatch(declaration, /NODE_BACKED_C_AUTHORITY/u);
  assert.doesNotMatch(declaration, /constructFanInGraphFunction/u);

  const runtime = await import(
    pathToFileURL(
      path.join(installedRoot, "build/semantic/code/src/gtl/m01/index.js")
    ).href
  );
  assert.equal(typeof runtime.typedNode, "function");
  assert.equal(Object.hasOwn(runtime, "TYPED_NODE_AUTHORITY"), false);
  assert.equal(Object.hasOwn(runtime, "NODE_BACKED_C_AUTHORITY"), false);
  assert.equal(Object.hasOwn(runtime, "constructFanInGraphFunction"), false);
});
