# E3 (H package): per recorded HS03 actor, the longest interval between
# admitted activity samples before and after admitting the CLI status rows.
# Input: the pinned HS03 metadata oracle (no stream content). A noise stdout
# row is classed as a status row by the byte length of the CLI status-row
# family seen in the recorded compactions (see H_RETURN).
import json, sys, collections, statistics
from datetime import datetime
def wall(t): return datetime.fromisoformat(t.replace('Z', '+00:00')).timestamp() * 1000
m = json.load(open(sys.argv[1]))
STATUS_LENGTHS = set(int(x) for x in sys.argv[2].split(','))
C = m['probeContracts']
byUnder = collections.defaultdict(list)
activity = collections.defaultdict(list)
probeOffsets = collections.defaultdict(list)
for adm, eid, et, ci, el, sig, cov, und, *_ in m['probes']:
    c = C[ci]; a = (c.get('scope') or {}).get('actorInvocationRef')
    if a is None: continue
    if und: byUnder[und].append((c['source'], sig, el))
    probeOffsets[a].append(wall(et) - el)
    if sig in ('coverage', 'external_interruption') or cov == 'unavailable': continue
    activity[a].append(el)
rows = collections.defaultdict(list)
for adm, eid, et, si, so, bl, dg in m['stdout']:
    q = [el for s, sig, el in byUnder.get(eid, []) if s == 'stdout' and sig == 'activity']
    rows[si].append((adm, wall(et), bl, q[0] if q else None))
def gaps(ts):
    ts = sorted(ts); return [(ts[i] - ts[i-1], ts[i-1]) for i in range(1, len(ts))]
out = []
for si, scope in enumerate(m['scopes']):
    a = scope['actorInvocationRef']
    r = sorted(rows[si])
    offs = [w - q for _, w, _, q in r if q is not None] or probeOffsets[a]
    off = statistics.median(offs); spread = max(abs(o - off) for o in offs)
    hb = [w - off for _, w, bl, q in r if q is None and bl in STATUS_LENGTHS]
    exit_ = [d for d in m['decisions'] if d.get('payload', {}).get('actorInvocationRef') == a and d['kind'] in ('actor_process_exited',)]
    end = wall(exit_[0]['eventTime']) - off if exit_ else None
    before = activity[a]; after = before + hb
    def series(ts):
        g = gaps(ts)
        if end is not None and end > max(ts): g.append((end - max(ts), max(ts)))
        return g
    gb, ga = series(before), series(after)
    out.append(dict(scope=si, heartbeats=len(hb), offsetSpreadMs=round(spread, 1),
        beforeMaxS=round(max(g for g, _ in gb) / 1000, 1), afterMaxS=round(max(g for g, _ in ga) / 1000, 1),
        beforeAtS=round(max(gb)[1] / 1000, 1), afterAtS=round(max(ga)[1] / 1000, 1),
        before=[sum(1 for g, _ in gb if g >= t * 1000) for t in (60, 120, 180)],
        after=[sum(1 for g, _ in ga if g >= t * 1000) for t in (60, 120, 180)]))
for o in out: print(json.dumps(o))
for k in ('before', 'after'):
    print(k, 'contained at 60/120/180 s:', [sum(1 for o in out if o[k][i] > 0) for i in range(3)], 'of', len(out))
