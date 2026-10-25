"""Allowlisted local package deployment; never accepts shell commands."""
import pathlib, subprocess, sys, threading, json, importlib.util, venv, os
PACKAGES={'akshare':('akshare','akshare'),'markitdown':('markitdown','markitdown'),'docling':('docling','docling')}
class Manager:
    def __init__(self, root):
        self.root=pathlib.Path(root); self.jobs={}; self.lock=threading.Lock()
    def python(self, tool):
        return self.root/tool/('Scripts/python.exe' if os.name=='nt' else 'bin/python')
    def status(self):
        result=[]
        for tool,(package,module) in PACKAGES.items():
            py=self.python(tool); state='not_installed'; detail='尚未安装'
            if py.is_file():
                try:
                    p=subprocess.run([str(py),'-c',f'import importlib.util; assert importlib.util.find_spec({module!r})'],capture_output=True,timeout=10)
                    state='installed' if p.returncode==0 else 'incomplete'; detail='环境检测通过' if p.returncode==0 else '安装不完整，可重试'
                except Exception: state='error'; detail='环境检测失败'
            with self.lock: job=dict(self.jobs.get(tool,{}))
            if job.get('running'): state='installing'
            elif job.get('error'): state='error'; detail=job['error']
            log=self.root/(tool+'.log')
            result.append(dict(id=tool,package=package,state=state,detail=detail,log=log.read_text(errors='replace')[-12000:] if log.exists() else ''))
        return result
    def install(self, tool):
        if tool not in PACKAGES: raise ValueError('Unknown tool')
        with self.lock:
            if self.jobs.get(tool,{}).get('running'): return
            if any(j.get('running') for j in self.jobs.values()): raise ValueError('另一个安装任务正在运行，请等待完成')
            self.jobs[tool]={'running':True}
        threading.Thread(target=self._install,args=(tool,),daemon=True).start()
    def _install(self, tool):
        error=''
        try:
            self.root.mkdir(parents=True,exist_ok=True)
            with (self.root/(tool+'.log')).open('w',encoding='utf-8') as log:
                log.write('Creating isolated Python environment...\n');log.flush()
                if not self.python(tool).exists(): venv.EnvBuilder(with_pip=True).create(self.root/tool)
                p=subprocess.run([str(self.python(tool)),'-m','pip','install','--disable-pip-version-check',PACKAGES[tool][0]],stdout=log,stderr=subprocess.STDOUT,timeout=1800)
                if p.returncode: raise RuntimeError('安装失败，请查看日志并重试')
                log.write('\nInstallation complete. Version snapshot follows.\n');log.flush()
                subprocess.run([str(self.python(tool)),'-m','pip','freeze'],stdout=log,stderr=subprocess.STDOUT,timeout=30)
        except Exception as e: error=str(e)
        with self.lock: self.jobs[tool]={'running':False,'error':error}

    def execute(self, payload):
        import tempfile,base64,re
        operation=payload.get('operation')
        tool={'markitdown':'markitdown','fund':'akshare'}.get(operation)
        if not tool: raise ValueError('Unknown operation')
        py=self.python(tool)
        if not py.is_file(): raise ValueError('请先安装对应工具')
        script=pathlib.Path(__file__).with_name('execute_tool.py')
        with tempfile.TemporaryDirectory(prefix='lr-task-') as tmp:
            if operation=='fund':
                code=payload.get('code','')
                if not isinstance(code,str) or not re.fullmatch(r'\d{6}',code):raise ValueError('基金代码必须为六位数字')
                argument=code
            else:
                extension=pathlib.Path(payload.get('name','')).suffix.lower()
                if extension not in {'.txt','.md','.html','.htm','.csv','.json'}:raise ValueError('当前仅支持文本类文件；Office/PDF 适配后续提供')
                content=base64.b64decode(payload.get('data',''),validate=True)
                if len(content)>2*1024*1024:raise ValueError('文件最大 2 MB')
                path=pathlib.Path(tmp)/('input'+extension);path.write_bytes(content);argument=str(path)
            output=pathlib.Path(tmp)/'output.json';errors=pathlib.Path(tmp)/'errors.txt'
            with output.open('w') as out,errors.open('w') as err:
                result=subprocess.run([str(py),str(script),operation,argument],stdout=out,stderr=err,timeout=90)
            if result.returncode:raise ValueError('工具执行失败：'+errors.read_text(errors='replace')[-2000:])
            if output.stat().st_size>4*1024*1024:raise ValueError('输出超过 4 MB 上限')
            return json.loads(output.read_text(encoding='utf-8'))
