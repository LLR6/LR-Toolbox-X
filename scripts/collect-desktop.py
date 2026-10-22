import pathlib, shutil, platform, zipfile
root=pathlib.Path('apps/desktop/src-tauri/target/release')
out=pathlib.Path('artifacts'); out.mkdir(exist_ok=True)
count=0
for pattern in ('bundle/nsis/*.exe','bundle/msi/*.msi','bundle/deb/*.deb','bundle/appimage/*.AppImage','bundle/rpm/*.rpm','bundle/dmg/*.dmg'):
    for path in root.glob(pattern): shutil.copy2(path,out/path.name); count+=1
assert count, 'No installers generated'
if platform.system()=='Windows':
    exe=root/'lr-toolbox-x.exe'
    assert exe.is_file()
    with zipfile.ZipFile(out/'LR-Toolbox-X_windows_x64_portable.zip','w',zipfile.ZIP_DEFLATED) as z: z.write(exe,exe.name)
    # The portable executable still requires the system WebView2 runtime.
print(f'Collected {count} installers')
