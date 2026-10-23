import {build} from 'esbuild';
await build({entryPoints:['apps/cli/lrtool.ts'],bundle:true,platform:'node',format:'esm',target:'node22',outfile:'dist-cli/lrtool.mjs',banner:{js:"import {createRequire as __lrx_create_require} from 'node:module'; const require=__lrx_create_require(import.meta.url);"}});
