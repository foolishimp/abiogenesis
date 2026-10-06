"""Reuse exact accepted Q11 flat projections, retaining their truthful immutable origins."""
from pathlib import Path
import hashlib,json
Q=Path(__file__).resolve().parent;D=Q.parent/'final-qualification-inputs-11'
for name in ['f11/source-authorship-records.json','current-source-supplier-view.json','metadata-projection-conservation.json','source-auth-current-correspondence.json']:
 assert (Q/name).read_bytes()==(D/name).read_bytes(),name
auth=json.loads((Q/'f11/source-authorship-records.json').read_bytes());assert(len(auth['records']),len(auth['chains']),sum(len(c['attributionSources'])for c in auth['chains']))==(174,23,90)
print(json.dumps({'flatProjectionBodiesUnchanged':4,'records':174,'chains':23,'spans':90,'newSourceAuthorship':False}))
