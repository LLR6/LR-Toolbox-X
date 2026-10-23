import {mkdir,copyFile} from 'node:fs/promises';
const root='apps/web/public/engines';
await mkdir(root,{recursive:true});
for(const file of ['worker.min.js']) await copyFile('node_modules/tesseract.js/dist/'+file,root+'/'+file);
for(const file of ['tesseract-core-lstm.wasm.js','tesseract-core-lstm.wasm']) await copyFile('node_modules/tesseract.js-core/'+file,root+'/'+file);
for(const lang of ['eng','chi_sim']) await copyFile(`node_modules/@tesseract.js-data/${lang}/4.0.0_best_int/${lang}.traineddata.gz`,`${root}/${lang}.traineddata.gz`);
await mkdir(root+'/ffmpeg',{recursive:true});
for(const file of ['worker.js','const.js','errors.js']) await copyFile('node_modules/@ffmpeg/ffmpeg/dist/esm/'+file,root+'/ffmpeg/'+file);
console.log('Local OCR models and fixed media worker prepared');
