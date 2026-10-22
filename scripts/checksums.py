import hashlib, pathlib, sys
root = pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'artifacts')
files = sorted(p for p in root.rglob('*') if p.is_file() and p.name != 'SHA256SUMS.txt')
assert files, 'No release artifacts'
lines = []
for path in files:
    assert path.stat().st_size > 0, f'Empty artifact: {path}'
    h=hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024*1024), b''): h.update(chunk)
    lines.append(f'{h.hexdigest()}  {path.relative_to(root).as_posix()}')
(root/'SHA256SUMS.txt').write_text('\n'.join(lines)+'\n')
print(f'Checksummed {len(files)} non-empty files')
