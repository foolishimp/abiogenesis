// A serialization of Node's observed events, not a test runner or pass oracle.
import { relative } from 'node:path';
const errorValue = error => error == null ? null : {
  name: String(error.name ?? 'Error'), message: String(error.message ?? error),
  stack: typeof error.stack === 'string' ? error.stack : null,
  code: error.code == null ? null : String(error.code),
  failureType: error.failureType == null ? null : String(error.failureType),
  cause: error.cause == null ? null : errorValue(error.cause),
};
const fileValue = file => file == null ? null : relative(process.cwd(), file).split('\\').join('/');
export default async function* report(source) {
  let ordinal = 0;
  const row = value => JSON.stringify({ ordinal: ordinal++, ...value }) + '\n';
  yield row({ type: 'begin', format: 'node-test-events-jsonl@1', nodeVersion: process.version });
  for await (const event of source) {
    const d = event.data;
    if (event.type === 'test:pass' || event.type === 'test:fail') {
      yield row({ type: 'case', passed: event.type === 'test:pass', name: d.name,
        file: fileValue(d.file), nesting: d.nesting, testNumber: d.testNumber,
        suite: d.details.type === 'suite', skip: d.skip ?? false, todo: d.todo ?? false,
        error: errorValue(d.details.error) });
    } else if (event.type === 'test:summary') {
      yield row({ type: 'summary', file: fileValue(d.file), counts: d.counts,
        success: d.success, durationMs: d.duration_ms });
    }
  }
  yield row({ type: 'end' });
}
