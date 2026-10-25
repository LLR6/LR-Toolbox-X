import {actions,execute} from '../packages/registry/src/index.ts';
import {studios} from '../apps/web/src/studios.ts';
import {openSourcePicks} from '../apps/web/src/open-source-picks.ts';
import {writeFile} from 'node:fs/promises';
const block=(x:unknown)=>'```json\n'+JSON.stringify(x,(_,v)=>typeof v==='bigint'?v.toString():v,2)+'\n```';
let out='# 全部工具逐项说明\n\n本目录由实际注册表生成。便携工具、特色工作台和第三方推荐分开介绍；推荐不等于已集成。\n\n';
for(const a of actions){let result;try{result=await execute(a.id,a.example);}catch{result='示例执行失败，请查看工具限制';}out+=`## ${a.name}\n\n- 标识：\`${a.id}\`\n- 分类：${a.category}\n- 用途与限制：${a.description}\n- 平台：${a.platforms.join('、')}\n- 风险：${a.risk_level}；权限：${a.permissions.join('、')||'无额外权限'}\n\n输入字段与约束：\n\n${block(a.input_schema)}\n\n输入示例：\n\n${block(a.example)}\n\n实际示例输出：\n\n${block(result)}\n\n`;}
out+='# 特色工作台逐项说明\n\n';for(const s of studios)out+=`## ${s.name}\n\n${s.intro}\n\n- 用途：${s.use}\n- 引擎/运行方式：${s.engine}\n- [上游项目](${s.repo})\n- 接入与平台限制：[逐项状态](LOCAL-INTEGRATIONS.md)。桌面配套入口不在浏览器执行。\n\n`;
out+='# 开源资源逐项说明\n\n';for(const p of openSourcePicks)out+=`## ${p.name}\n\n${p.intro}\n\n- 场景：${p.use}\n- 当前状态：${p.mode}\n- [官方项目](https://github.com/${p.repo})\n\n`;
await writeFile('docs/TOOLS.md',out);console.log(`${actions.length} actions, ${studios.length} studios, ${openSourcePicks.length} projects`);
