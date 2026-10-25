"""Invoked only inside an isolated tool environment with a fixed operation."""
import sys,json,pathlib
operation=sys.argv[1]
if operation=='markitdown':
 from markitdown import MarkItDown
 result=MarkItDown(enable_plugins=False).convert_local(sys.argv[2])
 print(json.dumps({'text':result.text_content},ensure_ascii=False))
elif operation=='fund':
 import akshare as ak
 frame=ak.fund_open_fund_info_em(symbol=sys.argv[2],indicator='单位净值走势')
 print(json.dumps({'csv':frame.tail(2000).to_csv(index=False),'rows':min(len(frame),2000),'source':'AKShare / 东方财富 · 单位净值走势'},ensure_ascii=False))
else:raise ValueError('Unknown operation')
