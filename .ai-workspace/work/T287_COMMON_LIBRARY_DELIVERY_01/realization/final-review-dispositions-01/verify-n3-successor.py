from pathlib import Path
import hashlib
import json
import re

REPO = Path('/Users/jim/src/apps/abiogenesis')
RECORD = Path(__file__).resolve().parent
TICKET = REPO / '.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def anchors(body):
    found, seen = [], {}
    for line in body.splitlines():
        match = re.match(r'^#{1,6}\s+(.+?)\s*#*$', line)
        if match:
            anchor = re.sub(r'[^\w\- ]', '', match.group(1).lower()).replace(' ', '-')
            occurrence = seen.get(anchor, 0)
            seen[anchor] = occurrence + 1
            found.append(anchor if occurrence == 0 else anchor + '-' + str(occurrence))
    found.extend(re.findall(r'<a\s+(?:name|id)=["\']([^"\']+)', body))
    return found


helper = REPO / 'build_tenants/abiogenesis/typescript/test_env/support/fresh-process-runtime-proof.mjs'
helper_body = helper.read_text()
assert 'const run = ownedProcessProof === undefined ? runFreshWorker' in helper_body
assert ': (value, ordinal) => runOwnedFreshWorker(value, ownedProcessProof.evidenceRoot, ordinal);' in helper_body
callers = []
for path in sorted((REPO / 'build_tenants/abiogenesis/typescript/test_env/tests').glob('*.mjs')):
    body = path.read_text()
    if 'fresh-process-runtime-proof.mjs' in body:
        callers.append({'path': str(path.relative_to(REPO)), 'sha256': sha(path),
                        'owned_option_mentioned': 'ownedProcessProof' in body})
assert len(callers) == 9
assert sum(not row['owned_option_mentioned'] for row in callers) == 8
conditional = [row for row in callers if row['owned_option_mentioned']]
assert len(conditional) == 1
assert conditional[0]['path'].endswith('/t287-worksite-command-execution.test.mjs')
command_body = (REPO / conditional[0]['path']).read_text()
assert '...(proof === null ? {} : { ownedProcessProof: { evidenceRoot: join(proof.root, "fresh-replay") } })' in command_body
source_result = {
    'activation': 'N3-IMPORTER-ACCOUNTING-01',
    'classification': '8 importers without opt-in plus 1 conditional command test with legacy default',
    'helper': {'path': str(helper.relative_to(REPO)), 'sha256': sha(helper)},
    'callers': callers,
    'source_routing_check_only': True,
    'Product_execution': False,
    'owned_group_execution_claim': False,
    'earlier_corrected_check_credit': False,
}
addition = (RECORD / 'ticket-addition.md').read_text()
ticket_body = TICKET.read_text()
assert '## Final Review Dispositions 01' not in ticket_body
checks = []
for path in sorted(RECORD.glob('*.md')):
    base = TICKET.parent if path.name == 'ticket-addition.md' else path.parent
    for label, target in re.findall(r'\[([^\]]+)\]\(([^)]+)\)', path.read_text()):
        if re.match(r'[a-z]+://', target):
            continue
        destination, _, fragment = target.partition('#')
        resolved = (base / destination).resolve() if destination else (
            TICKET if path.name == 'ticket-addition.md' else path)
        assert resolved.exists(), (str(path), target)
        body = resolved.read_text() if fragment else ''
        if resolved == TICKET:
            body += addition
        assert not fragment or fragment in anchors(body), (str(path), target)
        checks.append({'from': str(path.relative_to(REPO)), 'label': label,
                       'target': target, 'resolved': str(resolved.relative_to(REPO)),
                       'anchor': fragment or None, 'valid': True,
                       'base': 'owning ticket' if path.name == 'ticket-addition.md' else 'carrier'})

(RECORD / 'N3-source-relations-credited.json').write_text(json.dumps(source_result, indent=2) + '\n')
(RECORD / 'links-credited-preflight.json').write_text(json.dumps({
    'activation': 'N3-IMPORTER-ACCOUNTING-01', 'checked': len(checks), 'rows': checks,
    'ticket_anchor': 'prospective append verified',
    'earlier_corrected_check_credit': False,
}, indent=2) + '\n')
print(json.dumps({'activation': 'N3-IMPORTER-ACCOUNTING-01', 'importers': 9,
                  'without_opt_in': 8, 'conditional_with_legacy_default': 1,
                  'links_checked': len(checks), 'Product_execution': False}, indent=2))
