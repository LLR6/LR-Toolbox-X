"""Package only downloaded CI artifacts; do not synthesize installer filenames."""
import pathlib, shutil, zipfile
root=pathlib.Path('downloaded'); out=pathlib.Path('release-assets'); out.mkdir(exist_ok=True)
for group in root.iterdir():
    if group.name.startswith('desktop-'):
        for p in group.rglob('*'):
            if p.is_file() and p.suffix in ('.exe','.msi','.deb','.AppImage','.rpm','.dmg','.zip'): shutil.copy2(p,out/p.name)
    elif group.name=='android-development':
        for p in group.rglob('*'):
            if p.suffix in ('.apk','.aab'): shutil.copy2(p,out/('LR-Toolbox-X-Android'+p.suffix))
    elif group.name.startswith('core-'):
        with zipfile.ZipFile(out/(group.name.replace('core-','lrtool_')+'.zip'),'w',zipfile.ZIP_DEFLATED) as z:
            for p in group.rglob('*'):
                if p.is_file(): z.write(p,p.relative_to(group))
            for p in ('LICENSE','THIRD_PARTY_NOTICES.md','artifacts/NPM-LICENSES.txt'): z.write(p,pathlib.Path(p).name)
with zipfile.ZipFile(out/'LR-Toolbox-X-Web.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in pathlib.Path('dist').rglob('*'):
        if p.is_file(): z.write(p,p.relative_to('dist'))
    z.write('LICENSE','LICENSE')
for p in ('artifacts/NPM-LICENSES.txt','THIRD_PARTY_NOTICES.md','LICENSE'): shutil.copy2(p,out/pathlib.Path(p).name)
assert (out/'LR-Toolbox-X-Android.apk').is_file(), 'Android APK missing'
assert any(out.glob('*.exe')), 'Windows build missing'
assert any(out.glob('*.AppImage')), 'Linux AppImage missing'
print(f'Prepared {len(list(out.iterdir()))} real files')
