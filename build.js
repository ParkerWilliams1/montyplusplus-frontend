const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

fs.mkdirSync('dist', { recursive: true });

function copyDir(srcDir) {
  if (!fs.existsSync(srcDir)) return;
  for (const file of fs.readdirSync(srcDir)) {
    fs.copyFileSync(path.join(srcDir, file), path.join('dist', file));
  }
}

copyDir('src/html');
copyDir('src/css');

const tsDir = 'src/ts';
const entryPoints = {};
for (const file of fs.readdirSync(tsDir)) {
  if (!file.startsWith('_') && (file.endsWith('.ts') || file.endsWith('.js'))) {
    const name = path.basename(file, path.extname(file)) + '.bundle';
    entryPoints[name] = path.join(tsDir, file);
  }
}

const buildOptions = {
  entryPoints,
  bundle: true,
  outdir: 'dist',
  minify: !isWatch,
  sourcemap: isWatch,
  target: ['es2020'],
};

if (isWatch) {
  esbuild.context(buildOptions).then(async ctx => {
    await ctx.watch();
    const { host, port } = await ctx.serve({ servedir: 'dist', port: 3000 });
    console.log(`Serving at http://${host}:${port}`);
  });
} else {
  esbuild.build(buildOptions).then(() => console.log('Build complete.'));
}
