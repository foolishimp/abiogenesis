#!/usr/bin/env python3
import datetime,json,pathlib,sys
sys.dont_write_bytecode=True
from bounded import run,save
job=json.load(sys.stdin);folder=pathlib.Path(job['folder']);error=None
try:run(folder,job['argv'],job['cwd'],job['environment'],datetime.datetime.fromisoformat(job['deadlineUtc'].replace('Z','+00:00')),job['capMs'],job['maxBytes'])
except Exception as e:error=str(e)
finally:
 size=sum(p.stat().st_size for p in [folder/'stdout.raw',folder/'stderr.raw'] if p.exists())
 save(folder.parent/(folder.name+'.final-capture.json'),{'bytes':size,'limit':job['maxBytes'],'withinLimit':size<=job['maxBytes'],'ownerFailure':error})
sys.exit(1 if error else 0)
