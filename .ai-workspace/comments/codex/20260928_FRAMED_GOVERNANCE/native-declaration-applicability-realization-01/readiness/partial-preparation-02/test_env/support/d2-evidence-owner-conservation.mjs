import assert from 'node:assert/strict';

// Test-only inverse of exactly the granted08 revision collector delta.
// Every other byte remains part of the inherited conservation comparison.
export function restorePre08RevisionCollector(source) {
  const changes = [
    [
      '      if (bridge === null || bridge.event.eventId !== event.eventId ||\n        bridge.event.admissionOrdinal >= construction.event.admissionOrdinal) return null;',
      '      if (bridge === null || bridge.event.admissionOrdinal >= construction.event.admissionOrdinal) return null;',
    ],
    [
      '        selectValidatedRuntimeEventPrefix(Object.freeze(owner.events.filter(e => e.admissionOrdinal < bridge.event.admissionOrdinal))));',
      '        selectValidatedRuntimeEventPrefix(owner.events.filter(e => e.admissionOrdinal < bridge.event.admissionOrdinal)));',
    ],
  ];
  for (const [after, before] of changes) {
    assert.equal(source.split(after).length, 2, 'one exact approved08 postimage hunk is required');
    source = source.replace(after, before);
  }
  return source;
}
