import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("packed source-blind install exposes one relative M01/M02/M03 contract family", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-a5-f02-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, "artifacts");
  const consumer = join(scratch, "consumer");
  await mkdir(artifacts);
  await mkdir(consumer);

  const packed = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: packageRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(packed.stdout);
  const artifactPath = join(artifacts, packResult.filename);
  await writeFile(
    join(consumer, "package.json"),
    `${JSON.stringify({ private: true, type: "module" }, null, 2)}\n`,
    "utf8",
  );
  await execFileAsync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--offline",
      "--no-audit",
      "--no-fund",
      artifactPath,
    ],
    { cwd: consumer, maxBuffer: 10 * 1024 * 1024 },
  );

  const probePath = join(consumer, "probe.mjs");
  await writeFile(
    probePath,
    String.raw`
      import assert from "node:assert/strict";
      import { createHash } from "node:crypto";
      import { readFile, stat } from "node:fs/promises";
      import { dirname, isAbsolute, resolve, sep } from "node:path";
      import { fileURLToPath } from "node:url";

      import * as gtl from "@abiogenesis/typescript-tenant/gtl";
      import * as m01 from "@abiogenesis/typescript-tenant/gtl/m01";
      import * as m02 from "@abiogenesis/typescript-tenant/gtl/m02";
      import * as m03 from "@abiogenesis/typescript-tenant/abg/m03";

      const m01Path = fileURLToPath(
        import.meta.resolve("@abiogenesis/typescript-tenant/gtl/m01"),
      );
      const installedRoot = resolve(dirname(m01Path), "../../../..");
      assert.equal(installedRoot.includes("abiogenesis-5-f02-worktree"), false);

      const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
      const sha256File = async (path) => {
        const bytes = await readFile(path);
        return "sha256:" + createHash("sha256").update(bytes).digest("hex");
      };
      const relativeAsset = async (locator) => {
        assert.equal(isAbsolute(locator.path), false);
        const target = resolve(installedRoot, locator.path);
        assert.equal(
          target === installedRoot || target.startsWith(installedRoot + sep),
          true,
        );
        assert.equal((await stat(target)).isFile(), true);
        assert.equal(await sha256File(target), locator.contentDigest);
        return target;
      };

      const manifest = await readJson(
        resolve(installedRoot, "product-toolchain-manifest.json"),
      );
      const rows = manifest.publicContractCatalog.rows;
      for (const capabilityRef of [
        "abg.capability.gtl.declare@5",
        "abg.capability.gtl.admit@5",
        "abg.capability.gtl.serialize@5",
        "abg.capability.gtl.typecheck@5",
        "abg.capability.module.publish@5",
      ]) {
        assert.equal(manifest.declaredCapabilityRefs.includes(capabilityRef), true);
      }
      assert.equal(
        manifest.declaredCapabilityRefs.includes("abg.capability.gtl.validate@5"),
        false,
      );
      assert.equal(
        manifest.declaredCapabilityRefs.includes("abg.capability.gtl.publish@5"),
        false,
      );
      const row = (contractId) => {
        const matches = rows.filter((candidate) => candidate.contractId === contractId);
        assert.equal(matches.length, 1, contractId);
        return matches[0];
      };

      const nativeContracts = [
        ["abg.contract.gtl.m01", "./gtl/m01", "constructGraphFunction"],
        ["abg.contract.gtl.m02", "./gtl/m02", "modulePublication"],
        ["abg.contract.abg.m03", "./abg/m03", "isGtlProgramDiagnosticId"],
      ];
      for (const [contractId, packageExportPath, namedSymbol] of nativeContracts) {
        const contract = row(contractId);
        assert.equal(contract.contractKind, "native_typed_group");
        assert.equal(contract.nativeTypedLocator.packageExportPath, packageExportPath);
        assert.equal(contract.nativeTypedLocator.namedSymbol, namedSymbol);
        const exported = await import(
          "@abiogenesis/typescript-tenant" + packageExportPath.slice(1)
        );
        assert.equal(typeof exported[namedSymbol], "function");
        for (const declaration of contract.nativeTypedLocator.declarationInventory) {
          assert.equal(isAbsolute(declaration.declarationPath), false);
          const declarationPath = resolve(installedRoot, declaration.declarationPath);
          assert.equal((await stat(declarationPath)).isFile(), true);
          assert.equal(
            await sha256File(declarationPath),
            declaration.declarationDigest,
          );
        }
      }

      const corpusContract = row("abg.asset.gtl.language-conformance-corpus");
      const corpusPath = await relativeAsset(corpusContract.assetLocator);
      assert.equal(Object.hasOwn(corpusContract.assetLocator, "definitionRef"), false);
      const corpusSchemaContract = row(corpusContract.assetLocator.schemaContractId);
      assert.equal(
        corpusSchemaContract.contractId,
        "abg.schema.gtl-language-conformance-corpus",
      );
      const schemaPath = await relativeAsset(corpusSchemaContract.assetLocator);
      const schema = await readJson(schemaPath);
      assert.equal(
        corpusSchemaContract.assetLocator.definitionRef,
        "#/$defs/GtlLanguageConformanceCorpus",
      );
      assert.ok(schema.$defs.GtlLanguageConformanceCorpus);
      assert.deepEqual(
        schema.$defs.GtlLanguageConformanceCorpus.properties.entries.items
          .properties.input.oneOf,
        [
          { "$ref": "#/$defs/GtlProgramConformanceInput" },
          { minLength: 1, type: "string" },
        ],
      );

      const diagnosticContract = row(
        corpusContract.assetLocator.diagnosticVocabularyContractId,
      );
      const diagnosticPath = await relativeAsset(diagnosticContract.assetLocator);
      const diagnosticVocabulary = await readJson(diagnosticPath);
      assert.deepEqual(
        diagnosticVocabulary.values,
        [...m03.GTL_PROGRAM_DIAGNOSTIC_ID_VALUES],
      );

      const corpus = await readJson(corpusPath);
      assert.match(corpus.corpusRef, /^gtl-language-conformance-corpus:\/\/abiogenesis\/[a-f0-9]{64}$/u);
      const corpusCaseRefs = new Set(corpus.entries.map((entry) => entry.caseRef));
      for (const caseName of [
        "sort-coercion",
        "interface-mismatch",
        "role-fibre-confusion",
        "implementation-mismatch",
        "illegal-declaration-host",
        "duplicate-authority",
        "malformed-serialized-data",
        "missing-required-declaration",
        "inferred-undeclared-term",
        "law-c-of",
        "law-c-identity",
        "law-c-compose",
        "law-c-edge",
        "law-c-workflow",
        "law-c-batch",
        "law-c-retry",
      ]) {
        assert.equal(
          corpusCaseRefs.has(
            "gtl-conformance-case://abiogenesis/" + caseName + "@5",
          ),
          true,
          caseName,
        );
      }
      assert.equal(
        typeof corpus.entries.find((entry) =>
          entry.caseRef.endsWith("/sort-coercion@5")
        ).input,
        "string",
      );
      for (const entry of corpus.entries) {
        const report = m03.typecheckGtlProgram(entry.input);
        const observed = [...new Set(
          report.issues.map((issue) => issue.diagnosticId),
        )].sort();
        assert.deepEqual(observed, [...entry.expectedDiagnosticIds].sort(), entry.caseRef);
        assert.equal(report.passed, entry.expectedDiagnosticIds.length === 0, entry.caseRef);
        for (const issue of report.issues) {
          assert.equal(issue.axiomRef.endsWith("#axiom-evaluation"), true);
          assert.match(issue.requirementRef, /^specification\/requirements\//u);
          assert.deepEqual(issue.evidenceRefs, [issue.surfaceRef]);
        }
      }

      const sampleModule = corpus.entries.find(
        (entry) => entry.expectedDiagnosticIds.length === 0,
      ).input.module;
      const admittedModule = m02.admitModule(sampleModule);
      assert.equal(
        m02.serializeModuleCanonical(admittedModule),
        m02.serializeModuleCanonical(sampleModule),
      );
      const graphFunctionFor = (id) => {
        const value = admittedModule.graphFunctions.find(
          (candidate) => candidate.id === id,
        );
        assert.notEqual(value, undefined, id);
        return value;
      };
      const hello = graphFunctionFor(gtl.HELLO_WORLD_IDS.graphFunctionRef);
      const ordinaryBasis = structuredClone(hello);
      ordinaryBasis.name = "Installed generated ordinary GraphFunction";
      delete ordinaryBasis.id;
      delete ordinaryBasis.kind;
      delete ordinaryBasis.version;
      const leftIdentity = m01.identityGraphFunction({
        name: "Installed generated left identity",
        contractRef: hello.inputs[0],
      });
      const rightIdentity = m01.identityGraphFunction({
        name: "Installed generated right identity",
        contractRef: hello.inputs[0],
      });
      const outer = graphFunctionFor(
        gtl.GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
      );
      const inner = graphFunctionFor(
        gtl.SUBSTITUTED_HELLO_IDS.innerGraphFunctionRef,
      );
      const generatedVariants = {
        generic: m01.constructGraphFunction(ordinaryBasis),
        identity: m01.identityGraphFunction({
          name: "Installed generated identity",
          contractRef: hello.inputs[0],
        }),
        compose: m01.composeGraphFunctions({
          name: "Installed generated compose",
          left: leftIdentity,
          right: rightIdentity,
        }),
        substitute: m01.substituteGraphFunction({
          name: "Installed generated substitute",
          outer,
          targetVectorRef: outer.template.edges[0].edgeRef,
          inner,
        }),
        promote: m01.promoteGraphFunction({
          name: "Installed generated promote",
          source: hello,
          sourceRef: hello.inputs[0],
          targetRef: hello.outputs[0],
        }),
      };
      const fullBodyMutations = [
        (value) => { value.name += " changed"; },
        (value) => {
          value.environment.carries.push(
            "contract://test/a5-f02/installed-mutated-carry@5",
          );
        },
        (value) => {
          value.inputs[0] =
            "contract://test/a5-f02/installed-mutated-input@5";
        },
        (value) => {
          value.outputs[0] =
            "contract://test/a5-f02/installed-mutated-output@5";
        },
        (value) => { value.template.graphRef += "/mutated"; },
        (value) => {
          value.template.nodes[0].term.inputCarrierRef =
            "contract://test/a5-f02/installed-mutated-node@5";
        },
        (value) => {
          value.effects.push("effect://test/a5-f02/installed-mutated@5");
        },
        (value) => {
          value.declarations["test.a5_f02.installed_mutated"] = "true";
        },
        (value) => { value.tags.push("installed-mutated"); },
      ];
      for (const [variant, graphFunction] of Object.entries(generatedVariants)) {
        assert.deepEqual(
          m01.admitGraphFunction(structuredClone(graphFunction)),
          graphFunction,
          variant + "/object",
        );
        assert.deepEqual(
          m01.admitGraphFunction(JSON.stringify(graphFunction)),
          graphFunction,
          variant + "/text",
        );
        for (const mutate of fullBodyMutations) {
          const changed = structuredClone(graphFunction);
          mutate(changed);
          assert.throws(
            () => m01.admitGraphFunction(changed),
            /canonical authoring identity/u,
            variant + "/mutated-object",
          );
          assert.throws(
            () => m01.admitGraphFunction(JSON.stringify(changed)),
            /canonical authoring identity/u,
            variant + "/mutated-text",
          );
        }
      }
      const sampleGraphFunction = admittedModule.graphFunctions[0];
      const { kind: _kind, id, version: _version, ...graphFunctionBasis } =
        sampleGraphFunction;
      const constructed = m01.constructGraphFunction({
        ...graphFunctionBasis,
        id,
      });
      assert.deepEqual(
        m01.serializeGraphFunction(constructed),
        m01.admitGraphFunction(sampleGraphFunction),
      );
      assert.equal("resolveGraphFunctionId" in m01, false);
      assert.equal("resolveGraphFunctionId" in gtl, false);
      assert.equal("finalizeGraphFunction" in m01, false);
      assert.equal("finalizeGraphFunction" in gtl, false);

      process.stdout.write(JSON.stringify({
        corpusCaseCount: corpus.entries.length,
        installedRoot,
        nativeContractCount: nativeContracts.length,
      }));
    `,
    "utf8",
  );

  const probe = await execFileAsync("node", [probePath], {
    cwd: consumer,
    maxBuffer: 10 * 1024 * 1024,
  });
  const result = JSON.parse(probe.stdout);
  assert.equal(result.nativeContractCount, 3);
  assert.equal(result.corpusCaseCount >= 6, true);
  const canonicalConsumer = await realpath(consumer);
  assert.equal(
    result.installedRoot.startsWith(canonicalConsumer),
    true,
    JSON.stringify({ canonicalConsumer, installedRoot: result.installedRoot }),
  );
});
