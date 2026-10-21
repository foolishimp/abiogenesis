import { writeFileSync, closeSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
const [mode, root] = process.argv.slice(2);
const identity = { pid: process.pid, ppid: process.ppid,
  pgid: Number(execFileSync('/bin/ps', ['-o', 'pgid=', '-p', String(process.pid)], { encoding: 'utf8' }).trim()),
  recordedAt: process.hrtime.bigint().toString(), mode };
writeFileSync(join(root, 'child-identity.json'), JSON.stringify(identity));
if (mode === 'early_stdin_close') {
  closeSync(0);
  writeFileSync(join(root, 'child-stdin-closed.json'), JSON.stringify({ pid: process.pid, at: process.hrtime.bigint().toString() }));
  setTimeout(() => {
    writeFileSync(join(root, 'child-finite-exit.json'), JSON.stringify({ pid: process.pid, status: 0, at: process.hrtime.bigint().toString() }));
    process.exit(0);
  }, 300);
} else {
  const finite = setTimeout(() => {
    writeFileSync(join(root, 'child-control-deadline.json'), JSON.stringify({ pid: process.pid })); process.exit(42);
  }, 1000);
  let bytes = 0;
  process.stdin.on('data', chunk => { bytes += chunk.byteLength; });
  process.stdin.on('end', () => {
    clearTimeout(finite);
    writeFileSync(join(root, 'child-control-read.json'), JSON.stringify({ pid: process.pid, bytes }));
    process.stdout.write(JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify({ kind: 'stdin_control', bytes }) }) + '\n', () => process.exit(0));
  });
}
