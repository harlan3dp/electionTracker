import {readFileSync,writeFileSync} from 'node:fs'
// Git-integrated Pages consumes a plain advanced-mode Worker, not Wrangler's
// deprecated --outfile multipart upload envelope or a directory upload bundle.
const worker=readFileSync('.wrangler/pages/index.js','utf8')
if(worker.startsWith('------formdata'))throw Error('Invalid Worker upload envelope')
writeFileSync('dist/_worker.js',worker)
