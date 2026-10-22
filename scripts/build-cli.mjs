import {build} from 'esbuild';
await build({entryPoints:['apps/cli/lrtool.ts'],bundle:true,platform:'node',format:'esm',target:'node22',outfile:'dist-cli/lrtool.mjs',banner:{js:"import {createRequire} from 'node:module'; const require=createRequire(import.meta.url);"}});
