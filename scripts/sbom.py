"""Create CycloneDX component inventory from resolved npm and Cargo metadata."""
import json, subprocess, pathlib, urllib.parse
components = []
lock = json.loads(pathlib.Path('package-lock.json').read_text())
for path, item in lock['packages'].items():
    if not path or 'version' not in item:
        continue
    name = path.rsplit('node_modules/', 1)[-1]
    component = {'type': 'library', 'name': name, 'version': item['version'], 'purl': f"pkg:npm/{urllib.parse.quote(name, safe='/')}@{item['version']}"}
    if item.get('license'):
        component['licenses'] = [{'expression': item['license']}]
    components.append(component)
metadata = json.loads(subprocess.check_output(['cargo', 'metadata', '--format-version', '1', '--locked']))
for item in metadata['packages']:
    component = {'type': 'library', 'name': item['name'], 'version': item['version'], 'purl': f"pkg:cargo/{item['name']}@{item['version']}"}
    if item.get('license'):
        component['licenses'] = [{'expression': item['license']}]
    components.append(component)
out = pathlib.Path('artifacts'); out.mkdir(exist_ok=True)
(out / 'SBOM.cdx.json').write_text(json.dumps({'bomFormat':'CycloneDX','specVersion':'1.5','version':1,'metadata':{'component':{'type':'application','name':'LR Toolbox X','version':json.loads(pathlib.Path('package.json').read_text())['version']}},'components':components}, indent=2)+'\n')
print(f'Wrote {len(components)} resolved components (portable + native core; desktop and Android not included).')
