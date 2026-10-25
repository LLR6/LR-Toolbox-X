"""LR local task desk. Standard-library only; binds to loopback."""
import http.server, pathlib, subprocess, shutil, threading, urllib.request, urllib.error, json, webbrowser, time
ROOT = pathlib.Path(__file__).resolve().parent
MODEL = 'qwen3:1.7b'
OLLAMA = 'http://127.0.0.1:11434'
def available():
    try:
        urllib.request.urlopen(OLLAMA+'/api/tags', timeout=2).close()
        return True
    except Exception:
        return False
if not shutil.which('ollama'):
    raise SystemExit('Please install Ollama from https://ollama.com/download then run again.')
if not available():
    subprocess.Popen(['ollama','serve'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(30):
        if available(): break
        time.sleep(1)
    else: raise SystemExit('Ollama did not start. Please check the Ollama app.')
print('Preparing '+MODEL+' (first run downloads model weights)...', flush=True)
subprocess.run(['ollama','pull',MODEL],check=True)
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT/'web'),**kwargs)
    def do_POST(self):
        if self.path!='/api/local/chat/completions':
            self.send_error(404); return
        origin=self.headers.get('Origin')
        if origin and origin!='http://127.0.0.1:8765':
            self.send_error(403); return
        try:
            size=int(self.headers.get('Content-Length','0'))
            if size<1 or size>200000: self.send_error(413); return
            payload=json.loads(self.rfile.read(size))
            payload['model']=MODEL
            payload['stream']=False
            request=urllib.request.Request(OLLAMA+'/v1/chat/completions',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json'})
            with urllib.request.urlopen(request,timeout=180) as response:
                data=response.read(2_000_000)
            self.send_response(200); self.send_header('Content-Type','application/json'); self.end_headers();self.wfile.write(data)
        except Exception:
            self.send_error(502,'Local model request failed; inspect Ollama and retry.')
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8765),Handler)
print('LR Agent: http://127.0.0.1:8765 — close this window to stop.',flush=True)
webbrowser.open('http://127.0.0.1:8765')
try: server.serve_forever()
except KeyboardInterrupt: server.server_close()
