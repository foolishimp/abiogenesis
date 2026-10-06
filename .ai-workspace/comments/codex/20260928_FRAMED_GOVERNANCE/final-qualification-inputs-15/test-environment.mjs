// Process environment for selected disposable component fixtures, never native admission.
import fs from 'node:fs';
import {resolve} from 'node:path';
for (const name of ['.tmp','.npm-cache','.npm-prefix','reports/f16']) fs.mkdirSync(resolve(name),{recursive:true});
process.env.TMPDIR=resolve('.tmp');
process.env.ABI5_F16_PROOF_ROOT=resolve('reports/f16');
process.env.GIT_CONFIG_GLOBAL=resolve('.global.gitconfig');
process.env.GIT_CONFIG_SYSTEM=resolve('.system.gitconfig');
process.env.GIT_CONFIG_NOSYSTEM='1';
process.env.npm_config_cache=resolve('.npm-cache');
process.env.npm_config_prefix=resolve('.npm-prefix');
process.env.npm_config_userconfig=resolve('.user.npmrc');
process.env.npm_config_globalconfig=resolve('.global.npmrc');
process.env.GIT_OPTIONAL_LOCKS='0';
