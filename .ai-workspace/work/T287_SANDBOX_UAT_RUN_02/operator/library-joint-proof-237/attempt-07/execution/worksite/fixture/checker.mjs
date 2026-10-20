import { readFile } from 'node:fs/promises';

const value = await readFile(new URL('./value.txt', import.meta.url), 'utf8');
if (value === 'fixed\n') {
  process.stdout.write('FIXTURE_VALUE_FIXED\n');
} else {
  process.stdout.write('FIXTURE_VALUE_BAD expected=fixed actual=' + JSON.stringify(value) + '\n');
  process.exitCode = 1;
}
