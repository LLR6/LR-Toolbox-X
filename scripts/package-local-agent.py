from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]
out=root/'dist/downloads/lr-local-agent.zip'
out.parent.mkdir(exist_ok=True)
with ZipFile(out,'w',ZIP_DEFLATED) as z:
    for p in (root/'local-agent').rglob('*'):
        if p.is_file() and '__pycache__' not in p.parts:
            z.write(p,p.relative_to(root/'local-agent'))
    for p in (root/'dist').rglob('*'):
        if p.is_file() and not {'downloads','engines'}.intersection(p.relative_to(root/'dist').parts):
            z.write(p,Path('web')/p.relative_to(root/'dist'))
print(out)
