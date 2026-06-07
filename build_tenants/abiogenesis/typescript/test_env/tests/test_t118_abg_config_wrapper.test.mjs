// T-118: the consolidated abg.config.json wrapper envelope must be admitted
// (kind + positive-integer version) before sections are read, failing closed on
// a malformed / foreign config.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { loadAbgConfigSectionsFromFile } from "../../build/semantic/code/src/shared/abg_config/load.js";

const validConfig = {
  kind: "abg_config_bundle",
  version: 1,
  levers: {
    kind: "abg_lever_overrides_bundle",
    abgDefaultsFamily: "abg_defaults",
    version: 1,
    bundleRef: "lever-overrides://test",
    overrides: {}
  }
};

async function writeConfig(obj) {
  const dir = await mkdtemp(path.join(tmpdir(), "t118-cfg-"));
  const file = path.join(dir, "abg.config.json");
  await writeFile(file, JSON.stringify(obj), "utf8");
  return file;
}

test("T-118 abg.config wrapper: valid envelope admits + exposes sections", async () => {
  const sections = loadAbgConfigSectionsFromFile(await writeConfig(validConfig));
  assert.ok(sections.levers !== null);
  assert.equal(sections.fallbacks, null);
});

test("T-118 abg.config wrapper: wrong kind fails closed", async () => {
  const file = await writeConfig({ ...validConfig, kind: "wrong_bundle" });
  assert.throws(() => loadAbgConfigSectionsFromFile(file), /kind/u);
});

test("T-118 abg.config wrapper: missing kind fails closed", async () => {
  const { kind: _kind, ...noKind } = validConfig;
  const file = await writeConfig(noKind);
  assert.throws(() => loadAbgConfigSectionsFromFile(file), /kind/u);
});

test("T-118 abg.config wrapper: non-positive-integer version fails closed", async () => {
  const fZero = await writeConfig({ ...validConfig, version: 0 });
  assert.throws(() => loadAbgConfigSectionsFromFile(fZero), /version/u);
  const fString = await writeConfig({ ...validConfig, version: "1" });
  assert.throws(() => loadAbgConfigSectionsFromFile(fString), /version/u);
  const { version: _v, ...noVersion } = validConfig;
  const fMissing = await writeConfig(noVersion);
  assert.throws(() => loadAbgConfigSectionsFromFile(fMissing), /version/u);
});
