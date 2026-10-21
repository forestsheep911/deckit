#!/usr/bin/env node
// Deckit adapter; the pinned Archify renderer subset is in ../vendor/.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { capture } from './capture.mjs';
import { fileURLToPath } from 'node:url';
import { compileWorkflow } from '../vendor/archify/renderers/workflow/workflow-compiler.mjs';
import { registerLocale } from '../vendor/archify/renderers/shared/i18n.mjs';
import { esc } from '../vendor/archify/renderers/shared/utils.mjs';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function complexity(workflow) {
  const outgoing = new Map(), incoming = new Map();
  for (const edge of workflow.edges || []) {
    outgoing.set(edge.from, [...(outgoing.get(edge.from) || []), edge.to]);
    incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1);
  }
  const active = new Set(), visited = new Set();
  const visit = (id) => {
    if (active.has(id)) return true;
    if (visited.has(id)) return false;
    active.add(id);
    for (const target of outgoing.get(id) || []) if (visit(target)) return true;
    active.delete(id); visited.add(id); return false;
  };
  const branches = [...outgoing].filter(([, targets]) => targets.length > 1).map(([id]) => id);
  const merges = [...incoming].filter(([, count]) => count > 1).map(([id]) => id);
  const cycle = (workflow.nodes || []).some(({ id }) => visit(id));
  return { branches, merges, cycle, lanes: workflow.lanes?.length || 0 };
}

function within(root, target) {
  const relative = path.relative(root, target);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Path must be a child of the run directory: ${target}`);
  }
}

function rejectBrands(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (/brand/i.test(key)) throw new Error('Brand capture is outside the screenshot workflow. Use semantic node icons.');
    rejectBrands(child);
  }
}

export function buildSlide(workflow, { theme = 'light', accent } = {}) {
  if (workflow.schema_version !== 2 || workflow.diagram_type !== 'workflow') {
    throw new Error('Use workflow schema_version 2.');
  }
  rejectBrands(workflow);
  if (!['light', 'dark'].includes(theme)) throw new Error('Theme must be light or dark.');
  if (accent && !/^#[\da-f]{6}$/i.test(accent)) throw new Error('Accent must be a six-digit hex color.');
  registerLocale(workflow.meta?.locale || 'en', workflow.meta?.translations);
  const compiled = compileWorkflow({ workflow, qualityProfile: 'showcase' });
  if (!compiled.ok) throw new Error(JSON.stringify(compiled.receipt));
  const template = fs.readFileSync(path.join(skillRoot, 'vendor/archify/assets/template.html'), 'utf8');
  const styles = [...template.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(([style]) => style).join('\n');
  const palette = accent ? `--frontend-stroke:${accent};--frontend-text:${accent};--backend-stroke:${accent};--backend-text:${accent};` : '';
  // Static slide: no upstream viewer JS, toolbar, cards, animation or remote resources.
  const html = `<!doctype html><html lang="${esc(workflow.meta?.locale || 'en')}" data-theme="${theme}" data-preset="${esc(workflow.meta?.visual_preset || 'classic')}" data-motion="still"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src data:; script-src 'unsafe-inline'; img-src data:">
<title>${esc(workflow.meta.title)}</title>${styles}<style>
*{box-sizing:border-box}html[data-theme]{${palette}}html,body{margin:0!important;width:1600px!important;height:900px!important;overflow:hidden!important}
body{padding:40px 48px!important;background:var(--bg)!important;display:flex!important;flex-direction:column!important;gap:20px!important}
h1{margin:0!important;padding:0!important;font:600 42px/1.25 'Microsoft YaHei','Noto Sans CJK SC',sans-serif!important;color:var(--text)!important;letter-spacing:0!important;flex:none}
main{width:1504px;height:747px;flex:none;display:flex;align-items:center;justify-content:center}
main>svg{width:100%!important;height:100%!important;min-width:0!important;max-width:none!important;transform:none!important}
svg *{animation:none!important;transition:none!important}
</style></head><body><h1>${esc(workflow.meta.title)}</h1><main>${compiled.svg}</main>
<script>document.fonts.ready.then(()=>{
const svg=document.querySelector('main>svg'), title=document.querySelector('h1');
svg.querySelector(':scope > rect[fill="url(#grid)"]')?.remove();
const boxes=[...svg.children].filter(e=>typeof e.getBBox==='function'&&!['defs','style','title','desc'].includes(e.tagName)).map(e=>e.getBBox()).filter(b=>b.width||b.height);
if(boxes.length){const x=Math.min(...boxes.map(b=>b.x))-12,y=Math.min(...boxes.map(b=>b.y))-12;
const w=Math.max(...boxes.map(b=>b.x+b.width))-x+12,h=Math.max(...boxes.map(b=>b.y+b.height))-y+12;svg.setAttribute('viewBox',[x,y,w,h].join(' '));}
const frame=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal, scale=Math.min(frame.width/vb.width,frame.height/vb.height);
const text=[...svg.querySelectorAll('text')].filter(e=>e.textContent.trim()).map(e=>{
 const box=e.getBBox();return {text:e.textContent,px:parseFloat(getComputedStyle(e).fontSize)*scale,node:e.hasAttribute('data-node-label'),
 overflow:box.x<vb.x-1||box.y<vb.y-1||box.x+box.width>vb.x+vb.width+1||box.y+box.height>vb.y+vb.height+1};});
const qa={ready:true,width:innerWidth,height:innerHeight,captureViewBox:[vb.x,vb.y,vb.width,vb.height],titleFits:title.scrollHeight<=54&&title.scrollWidth<=1504,
 minTextPx:Math.min(...text.map(e=>e.px)),minNodePx:Math.min(...text.filter(e=>e.node).map(e=>e.px)),overflow:text.filter(e=>e.overflow),
 horizontalOverflow:document.documentElement.scrollWidth>1600};
const receipt=document.createElement('script');receipt.id='deckit-qa';receipt.type='application/json';receipt.textContent=JSON.stringify(qa);document.body.append(receipt);
});</script></body></html>`;
  return { html, layout: compiled.receipt };
}

function findBrowser(explicit) {
  const candidates = [explicit, process.env.DECKIT_CHROME,
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
    process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/microsoft-edge'];
  if (explicit && !fs.existsSync(explicit)) throw new Error(`Requested browser executable does not exist: ${explicit}`);
  const browser = candidates.find(candidate => candidate && fs.existsSync(candidate));
  if (!browser) throw new Error('Chrome/Edge/Chromium is required for PNG capture. Supply --browser or DECKIT_CHROME; no automatic installation.');
  return browser;
}

export async function renderFlow({ runDir, slideId, input, reason, browser, theme = 'light', accent }) {
  if (!/^\d{2}_[a-z0-9]+(?:_[a-z0-9]+)*$/.test(slideId || '')) throw new Error('Use a storyboard slide ID such as 03_approval_flow.');
  if (!reason?.trim()) throw new Error('Record why this page needs exact complex-flow rendering.');
  const root = fs.realpathSync(runDir), source = fs.realpathSync(input);
  within(root, source);
  const original = fs.readFileSync(source), workflow = JSON.parse(original.toString('utf8').replace(/^\uFEFF/, ''));
  const signals = complexity(workflow);
  if (!signals.branches.length && !signals.merges.length && !signals.cycle && signals.lanes < 3) {
    throw new Error('This is a simple linear flow. Keep this page on the ordinary imagegen route.');
  }
  const { html, layout } = buildSlide(workflow, { theme, accent });
  const browserPath = findBrowser(browser);
  const work = path.join(root, 'work/diagrams', slideId), assets = path.join(root, 'assets/generated-slides');
  fs.mkdirSync(work, { recursive: true }); fs.mkdirSync(assets, { recursive: true });
  for (const directory of [work, assets]) within(root, fs.realpathSync(directory));
  const pngPath = path.join(assets, `${slideId}.png`), receiptPath = path.join(work, 'render.json');
  // A revision uses a fresh run/version directory; never replace an approved artifact.
  for (const target of [pngPath, receiptPath]) if (fs.existsSync(target)) throw new Error(`Output already exists: ${target}`);
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'deckit-flow-'));
  try {
    const slideHtml = path.join(staging, 'slide.html');
    fs.writeFileSync(slideHtml, html);
    const { qa, png, version } = await capture(browserPath, staging, slideHtml);
    if (qa.width !== 1600 || qa.height !== 900 || !qa.titleFits || qa.horizontalOverflow || qa.overflow.length || qa.minNodePx < 18 || qa.minTextPx < 12) {
      throw new Error(`Slide readability failed; simplify wording, remove secondary labels or split the process into overview/detail pages: ${JSON.stringify(qa)}`);
    }
    if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || png.readUInt32BE(16) !== 3200 || png.readUInt32BE(20) !== 1800) {
      throw new Error('PNG capture is not the expected 3200 x 1800 image.');
    }
    const receipt = { schema_version: 1, renderer: 'deckit-complex-flow', delivery: 'bitmap-only', slide_id: slideId,
      reason, complexity: signals, source: path.relative(root, source).split(path.sep).join('/'), source_sha256: sha256(original),
      png: `assets/generated-slides/${slideId}.png`, png_sha256: sha256(png), width: 3200, height: 1800,
      upstream: JSON.parse(fs.readFileSync(path.join(skillRoot, 'vendor/archify/UPSTREAM.json'), 'utf8').replace(/^\uFEFF/, '')),
      browser: { executable: browserPath, version },
      layout, browser_check: qa, visual_review: 'pending', native_pptx: 'not-implemented' };
    fs.writeFileSync(path.join(work, 'slide.html'), html, { flag: 'wx' });
    fs.writeFileSync(pngPath, png, { flag: 'wx' });
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
    return receipt;
  } finally {
    // Only a directory created by mkdtemp above is eligible for cleanup.
    fs.rmSync(staging, { recursive: true, force: true, maxRetries: 4, retryDelay: 200 });
  }
}

async function main(args) {
  if (args.includes('--help')) {
    console.log('node render-flow.mjs --run-dir <run> --slide-id 03_approval_flow --input <workflow.json> --reason <complexity reason> [--theme light|dark] [--accent #2563eb] [--browser <Chrome executable>]');
    return;
  }
  const options = {};
  const keys = { '--run-dir': 'runDir', '--slide-id': 'slideId', '--input': 'input', '--reason': 'reason', '--browser': 'browser', '--theme': 'theme', '--accent': 'accent' };
  for (let i = 0; i < args.length; i += 2) {
    if (!keys[args[i]] || !args[i + 1]) throw new Error(`Unknown or incomplete option: ${args[i]}`);
    options[keys[args[i]]] = args[i + 1];
  }
  console.log(JSON.stringify(await renderFlow(options), null, 2));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
