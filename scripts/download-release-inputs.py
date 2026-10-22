"""Reuse successful CI outputs from the exact tagged source SHA."""
import json, os, subprocess
repo=os.environ['GITHUB_REPOSITORY']; sha=os.environ['GITHUB_SHA']
runs=json.loads(subprocess.check_output(['gh','run','list','--repo',repo,'--commit',sha,'--limit','100','--json','databaseId,workflowName,status,conclusion']))
selected={}
for name in ('CI','Desktop installers','CodeQL'):
    candidates=[r for r in runs if r['workflowName']==name and r['status']=='completed' and r['conclusion']=='success']
    if not candidates: raise SystemExit(f'No successful {name} run for exact tagged commit {sha}; wait for CI then rerun this release job.')
    selected[name]=max(candidates,key=lambda r:r['databaseId'])['databaseId']
for name in ('CI','Desktop installers'):
    subprocess.run(['gh','run','download',str(selected[name]),'--repo',repo,'--dir','downloaded'],check=True)
print(json.dumps({'source_sha':sha,'verified_runs':selected}))
