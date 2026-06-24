// scripts/build.js — Minify CSS and JS for production
const fs = require('fs');
const path = require('path');

async function build() {
  const publicDir = path.join(__dirname, '../public');
  
  // ── Minify CSS ─────────────────────────────────────────
  try {
    const csso = require('csso');
    const cssInput = fs.readFileSync(path.join(publicDir, 'style.css'), 'utf-8');
    const cssResult = csso.minify(cssInput);
    fs.writeFileSync(path.join(publicDir, 'style.min.css'), cssResult.css);
    const origSize = Buffer.byteLength(cssInput);
    const minSize = Buffer.byteLength(cssResult.css);
    console.log(`✅ CSS: ${(origSize/1024).toFixed(1)}KB → ${(minSize/1024).toFixed(1)}KB (saved ${((1-minSize/origSize)*100).toFixed(0)}%)`);
  } catch (e) {
    console.error('❌ CSS minify failed:', e.message);
  }

  // ── Minify JS ─────────────────────────────────────────
  try {
    const { minify } = require('terser');
    const jsInput = fs.readFileSync(path.join(publicDir, 'main.js'), 'utf-8');
    const jsResult = await minify(jsInput, {
      compress: { drop_console: false, passes: 2 },
      mangle: true,
      format: { comments: false }
    });
    fs.writeFileSync(path.join(publicDir, 'main.min.js'), jsResult.code);
    const origSize = Buffer.byteLength(jsInput);
    const minSize = Buffer.byteLength(jsResult.code);
    console.log(`✅ JS:  ${(origSize/1024).toFixed(1)}KB → ${(minSize/1024).toFixed(1)}KB (saved ${((1-minSize/origSize)*100).toFixed(0)}%)`);
  } catch (e) {
    console.error('❌ JS minify failed:', e.message);
  }

  console.log('\n✅ Build complete!');
}

build();
