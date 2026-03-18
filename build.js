const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const isWatch = process.argv.includes('--watch');

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });

function minifyHtml(content) {
  return content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+(\/?>)/g, '$1')
    .replace(/<(script|style)[^>]*>\s+/gi, m => m.trimEnd())
    .trim();
}

function minifyCss(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/;}/g, '}')
    .replace(/\n/g, '')
    .trim();
}

function copyDir(srcDir) {
  if (!fs.existsSync(srcDir)) return;
  for (const file of fs.readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join('dist', file);
    const ext = path.extname(file).toLowerCase();

    if (!isWatch && ext === '.html') {
      const minified = minifyHtml(fs.readFileSync(srcPath, 'utf8'));
      fs.writeFileSync(destPath, minified);
    } else if (!isWatch && ext === '.css') {
      const minified = minifyCss(fs.readFileSync(srcPath, 'utf8'));
      fs.writeFileSync(destPath, minified);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
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
  minifyWhitespace: !isWatch,
  minifyIdentifiers: !isWatch,
  minifySyntax: !isWatch,
  sourcemap: isWatch,
  target: ['es2020'],
  treeShaking: true,
  drop: isWatch ? [] : ['console', 'debugger'],
  legalComments: 'none',
  charset: 'utf8',
};

if (isWatch) {
  esbuild.context(buildOptions).then(async ctx => {
    await ctx.watch();
    const result = await ctx.serve({ servedir: 'dist', port: 3000 });
    console.log(`Serving at http://${result.host ?? 'localhost'}:${result.port}`);
  });
} else {
  esbuild.build(buildOptions).then(() => console.log('Build complete.'));
}
