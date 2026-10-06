import collections
import json
import pathlib

root = pathlib.Path(__file__).resolve().parent


def summarize(folder, boundaries):
    profile = json.loads((folder / 'owner-read.cpuprofile').read_text())
    nodes = {node['id']: node for node in profile['nodes']}
    parents = {child: node['id'] for node in profile['nodes'] for child in node.get('children', [])}

    def frame(node_id):
        item = nodes[node_id]['callFrame']
        url = item['url']
        name = item['functionName'] or '<anonymous>'
        suffix = url.split('/code/src/')[-1] if '/code/src/' in url else url
        return f"{name} {suffix}:{item['lineNumber'] + 1}"

    elapsed = 0
    rows = {}
    for label, low, high in boundaries:
        rows[label] = {'sampledUs': 0, 'self': collections.Counter(), 'inclusive': collections.Counter(),
                       'canonicalCaller': collections.Counter(), 'selectedCallers': collections.Counter()}
    for leaf, delta in zip(profile['samples'], profile['timeDeltas']):
        elapsed += delta
        label = next((label for label, low, high in boundaries if low <= elapsed / 1000 < high), None)
        if label is None:
            continue
        row = rows[label]
        row['sampledUs'] += delta
        row['self'][frame(leaf)] += delta
        chain = []
        cursor = leaf
        while cursor in nodes:
            chain.append(cursor)
            cursor = parents.get(cursor)
        for name in set(map(frame, chain)):
            row['inclusive'][name] += delta
        canonical = [index for index, node_id in enumerate(chain)
                     if nodes[node_id]['callFrame']['functionName'] == 'canonicalJson']
        if canonical and max(canonical) + 1 < len(chain):
            row['canonicalCaller'][frame(chain[max(canonical) + 1])] += delta
        selected = ('rawAdmitValue', 'runtimeEventPrefixDigest', 'deriveRuntimeEventCalculusProjection',
                    'decodeHistoricalEvents', 'sha256Canonical', 'projectRunSemanticReplayProjection')
        for index, node_id in enumerate(chain):
            if nodes[node_id]['callFrame']['functionName'] in selected and index + 1 < len(chain):
                row['selectedCallers'][frame(node_id) + ' <- ' + frame(chain[index + 1])] += delta
    for row in rows.values():
        total = row.pop('sampledUs')
        row['sampledMs'] = total / 1000
        for key in ('self', 'inclusive', 'canonicalCaller', 'selectedCallers'):
            row[key] = [{'function': name, 'sampledMs': value / 1000, 'percent': round(100 * value / total, 3)}
                        for name, value in row[key].most_common()]
    return rows


current = json.loads((root / 'owner-read-result.json').read_text())
marks = current['marks']
boundaries = [(marks[i]['stage'], marks[i - 1]['elapsedMs'], marks[i]['elapsedMs']) for i in range(1, len(marks))]
summary = summarize(root, boundaries)
summary['whole_profile'] = summarize(root, [('whole_profile', 0, float('inf'))])['whole_profile']
(root / 'cpu-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
old_folder = root.parent / 'runtime-analysis-01'
old = json.loads((old_folder / 'owner-read-result.json').read_text())
old_marks = old['marks']
old_summary = json.loads((old_folder / 'cpu-summary.json').read_text())
old_whole = summarize(old_folder, [('whole_profile', 0, float('inf'))])['whole_profile']
def sampled(rows, key, prefix):
    return sum(row['sampledMs'] for row in rows[key] if row['function'].startswith(prefix))
comparison = {
    'timingScope': 'Baseline helper bypasses prepareRead; repaired Public Run truth covers it. Held semantic identity is additional verification, not a repeated cold read. No full CLI comparison.',
    'baselinePhasesMs': {old_marks[i]['stage']: old_marks[i]['elapsedMs'] - old_marks[i - 1]['elapsedMs'] for i in range(1, len(old_marks))},
    'repairedPhasesMs': {marks[i]['stage']: marks[i]['elapsedMs'] - marks[i - 1]['elapsedMs'] for i in range(1, len(marks))},
    'identicalProjectionDigest': current['projectionDigest'] == old['projectionDigest'],
    'projectionDigest': current['projectionDigest'],
    'identicalEventCounts': current['historyEventCount'] == old['historyEventCount'] and current['runEventCount'] == old['runEventCount'],
    'identicalSelectedLogicalBytes': current['runLogicalBytes'] == old['runLogicalBytes'],
    'journalMetadataUnchanged': current['storageBefore'] == current['storageAfter'],
    'ownerClosePrefixUnchanged': current['finalHandoff']['prefix'] == current['prefix'],
    'sourceProvedRemovedWholeLogicalEventSerializationsPerColdRead': 2 * current['historyEventCount'],
    'canonicalWorkComparisonMs': {
        'baselineColdDecodeInclusive': sampled(old_whole, 'inclusive', 'decodeHistoricalEvents '),
        'repairedColdDecodeInclusive': sampled(summary['whole_profile'], 'inclusive', 'decodeHistoricalEvents '),
        'baselineColdPhaseCanonicalInclusive': sampled(old_summary['prefix'], 'inclusive', 'canonicalJson '),
        'repairedColdPhaseCanonicalInclusive': sampled(summary['history_reopened'], 'inclusive', 'canonicalJson '),
        'baselineColdPhaseDecoderDirectCanonical': sampled(old_summary['prefix'], 'canonical_parent', 'decodeHistoricalEvents '),
        'repairedColdPhaseDecoderDirectCanonical': sampled(summary['history_reopened'], 'canonicalCaller', 'decodeHistoricalEvents '),
    },
    'samplingLimit': 'Inclusive CPU samples are approximate wall-time attribution, not invocation counts. Phase cut assignment may straddle the sampling/profile-start offset by approximately 25 ms.',
    'actors': current['actors'], 'eventWrites': current['eventWrites'],
}
(root / 'comparison.json').write_text(json.dumps(comparison, indent=2) + '\n')
print(json.dumps(comparison, indent=2))
for phase, values in summary.items():
    print(phase, json.dumps({'inclusive': values['inclusive'][:15], 'canonicalCaller': values['canonicalCaller'][:8], 'selectedCallers': values['selectedCallers'][:16]}, indent=2))
