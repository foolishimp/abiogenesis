import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const SUPPORT = 'support://abi5-tests/library-joint-proof-237/mechanical-lifecycle';
export const COMMAND = 'command://abi5-tests/library-joint-proof-237/check';
export const CANDIDATE = 'fixture/value.txt';
export const STAGE = 'MECHANICAL_STAGE_BROKEN_VALUE: write only fixture/value.txt with the exact bytes broken followed by one newline.';
export const REPAIR = 'MECHANICAL_REPAIR_FIXED_VALUE: the admitted C2 diagnostic FIXTURE_VALUE_BAD identifies the deliberately broken candidate; restore only fixture/value.txt to fixed followed by one newline, preserving checker, source, rubric and the failed measurement.';
export const STAGED_REPORT = 'fixture candidate staged';
export const REPAIRED_REPORT = 'fixture candidate repaired';
export const expectedProgramDigest = 'sha256:804754973e3c8cc6ff1dd91eb59824aa3d4bdf7ac7be8820c17d8e71c33bd8e2';

// Supplies ordinary workload data to the existing constructWorkloadInput owner.
// No prefix, admission, Source, invocation authority or installed identity is
// constructed here. Actual execution must select its accepted installed owner.
export async function fixtureSelection() {
  const sources = await Promise.all(['source.md', 'checker.mjs', 'rubric.md'].map(async name => {
    const bytes = await readFile(new URL('./fixture/' + name, import.meta.url));
    return {path:'fixture/' + name, bytes,
      digest:'sha256:' + createHash('sha256').update(bytes).digest('hex')};
  }));
  const paths = sources.map(source => source.path);
  const request = {
    taskRef:'task://abi5-tests/library-joint-proof-237/original',
    task:sources[0].bytes.toString('utf8'),
    requiredSupportRefs:[SUPPORT],
    authorityRefs:['authority://abi5-tests/library-joint-proof-237/scratch-workload'],
    readRoots:[...paths, CANDIDATE], maxContextFiles:32,
    maxContextBytes:262144, maxPromptBytes:1048576,
    workOrders:{construction:{
      outcome:'Perform only the selected mechanical fixture contribution; keep the parent obligation unresolved.',
      instructions:['Read source, checker and rubric. Only the native Construction actor may write fixture/value.txt. First stage the deliberate defect; repair only after the actual C2 diagnostic. Do not execute the checker yourself or alter any immutable fixture file.'],
      readFirst:paths, writeRoots:[CANDIDATE], checks:[],
    }},
    testing:{selectedPaths:[...paths, CANDIDATE],
      commands:[{commandId:COMMAND, executable:'node', args:['fixture/checker.mjs'],
        relativeCwd:'.', environment:{}, timeoutMs:10000,
        terminationGraceMs:1000, expectedReports:[]}],
      outcomePredicates:[
        {predicateId:'predicate://abi5-tests/library-joint-proof-237/exit', predicateKind:'process_exit',
          declaration:{validationCommandId:COMMAND, equals:0}},
        {predicateId:'predicate://abi5-tests/library-joint-proof-237/stdout', predicateKind:'stdout_exact',
          declaration:{validationCommandId:COMMAND, equals:'FIXTURE_VALUE_FIXED\n'}},
      ], allowedWriteTerritories:[],
    },
    assessment:{sources:paths, candidatePath:CANDIDATE, rubricPath:'fixture/rubric.md'},
  };
  return {request, sources};
}

// Passed to the existing native worker environment at later actual execution.
// The root is the actual scratch WorkspaceManifest canonicalRoot, never inferred.
export function responderEnvironment(worksiteRoot, mode) {
  if (!['basis', 'audit'].includes(mode)) throw new TypeError('Explicit fixture mode required');
  if (typeof worksiteRoot !== 'string' || !worksiteRoot.startsWith('/')) throw new TypeError('Exact scratch root required');
  return {ABG_TS_CLAUDE_COMMAND:fileURLToPath(new URL('./responder.mjs', import.meta.url)),
    ABI5_JOINT_PROOF_ROOT:worksiteRoot, ABI5_JOINT_PROOF_MODE:mode};
}
