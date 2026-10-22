import {test} from 'node:test';
import assert from 'node:assert/strict';
import {actions,execute,search,AppError} from '../packages/registry/src/index.ts';
import {runWorkflow} from '../packages/registry/src/workflow.ts';
for(const a of actions){
 test(`${a.id}: example and output schema`,async()=>{const result=await execute(a.id,a.example);if(a.expected!==undefined)assert.deepEqual(result,a.expected);else assert.notEqual(result,undefined);assert.ok(a.description&&a.name&&a.nameEn&&a.timeout>0&&a.platforms.length);});
 test(`${a.id}: rejects malformed input`,async()=>{await assert.rejects(()=>execute(a.id,{}),{code:'ValidationError'});await assert.rejects(()=>execute(a.id,{...a.example,unexpected:'value'}),{code:'ValidationError'});});
}
test('search, platform boundaries and unique IDs',async()=>{assert.equal(new Set(actions.map(a=>a.id)).size,actions.length);assert.ok(search('时间戳').length>=2);assert.equal(search('','android').length,0);await assert.rejects(()=>execute('json.format',{text:'{}'},'android'),{code:'PlatformUnsupportedError'});await assert.rejects(()=>execute('does.not.exist',{}),{code:'ActionError'});});
for(const [id,input] of [['json.format',{text:'{'}],['encoding.base64.decode',{text:'!!!!'}],['encoding.hex.decode',{text:'ff'}],['math.statistics',{text:'a,1'}],['json.pointer',{text:'{}',pointer:'/toString'}],['time.iso.timestamp',{text:'not a date'}],['color.hex.rgb',{text:'#ABC'}],['text.replace',{text:'a',search:'',replacement:'b'}]] as const){test(`${id}: invalid content`,async()=>{await assert.rejects(()=>execute(id,{...input}),AppError);});}
test('workflow chains actual actions and stops on failure',async()=>{assert.deepEqual(await runWorkflow([{action:'text.trim',input:{text:' LR '}},{action:'encoding.base64.encode',input:{},previousTo:'text'}]),['LR','TFI=']);await assert.rejects(()=>runWorkflow([{action:'json.format',input:{text:'{'}}]),AppError);});
test('Unicode round trip',async()=>{const text='中文目录/空 格/🧪/é';for(const codec of ['base64','hex','binary','uri']){const encoded=await execute(`encoding.${codec}.encode`,{text});assert.equal(await execute(`encoding.${codec}.decode`,{text:encoded}),text);}});
