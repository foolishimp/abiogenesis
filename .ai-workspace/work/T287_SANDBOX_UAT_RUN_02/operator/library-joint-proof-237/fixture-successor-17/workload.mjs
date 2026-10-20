import { fileURLToPath } from 'node:url';
import { responderEnvironment as originalResponderEnvironment } from '../continuation-09/workload.mjs';
export * from '../continuation-09/workload.mjs';

// Reuse the original fixture data, roots and checks; select only this responder.
export function responderEnvironment(worksiteRoot, mode) {
  return { ...originalResponderEnvironment(worksiteRoot, mode),
    ABG_TS_CLAUDE_COMMAND: fileURLToPath(new URL('./responder.mjs', import.meta.url)) };
}
