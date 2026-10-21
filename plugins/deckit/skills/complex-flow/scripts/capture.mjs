import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

// Use a disposable browser profile and an exact viewport; browser window size
// alone varies with platform window decorations and is not a layout receipt.
export async function capture(browser, staging, htmlFile) {
  if (typeof WebSocket !== 'function') throw new Error('PNG capture needs Node.js 22+.');
  const profile = path.join(staging, 'profile');
  const child = spawn(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-extensions', '--remote-debugging-port=0',
    '--remote-debugging-address=127.0.0.1', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let launchError, socket, sequence = 0;
  child.on('error', error => { launchError = error; });
  const pending = new Map(), events = new Map();
  try {
    const portFile = path.join(profile, 'DevToolsActivePort'), deadline = Date.now() + 10000;
    while (!fs.existsSync(portFile)) {
      if (launchError) throw launchError;
      if (child.exitCode !== null || Date.now() > deadline) throw new Error('Headless browser did not start.');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const [port, endpoint] = fs.readFileSync(portFile, 'utf8').trim().split(/\r?\n/);
    socket = new WebSocket(`ws://127.0.0.1:${port}${endpoint}`);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Browser connection timed out.')), 10000);
      socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      socket.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Browser connection failed.')); }, { once: true });
    });
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const call = pending.get(message.id);
        if (call) { clearTimeout(call.timer); pending.delete(message.id); message.error ? call.reject(new Error(message.error.message)) : call.resolve(message.result); }
      } else {
        const key = `${message.sessionId}:${message.method}`, event = events.get(key);
        if (event) { clearTimeout(event.timer); events.delete(key); event.resolve(); }
      }
    });
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Browser timeout: ${method}`)); }, 20000);
      pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
    const version = await send('Browser.getVersion');
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Page.enable', {}, sessionId);
    await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: 2, mobile: false }, sessionId);
    const loaded = new Promise((resolve, reject) => {
      const key = `${sessionId}:Page.loadEventFired`;
      events.set(key, { resolve, timer: setTimeout(() => { events.delete(key); reject(new Error('Slide load timed out.')); }, 20000) });
    });
    await send('Page.navigate', { url: pathToFileURL(htmlFile).href }, sessionId); await loaded;
    const measured = await send('Runtime.evaluate', {
      expression: '(async()=>{await document.fonts.ready;return JSON.parse(document.getElementById("deckit-qa").textContent)})()',
      awaitPromise: true, returnByValue: true,
    }, sessionId);
    if (measured.exceptionDetails) throw new Error('Browser font/layout measurement failed.');
    const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
    await send('Browser.close');
    return { qa: measured.result.value, png: Buffer.from(data, 'base64'), version: version.product };
  } finally {
    for (const call of pending.values()) clearTimeout(call.timer);
    for (const event of events.values()) clearTimeout(event.timer);
    socket?.close();
    if (child.exitCode === null && !launchError) {
      await new Promise(resolve => {
        const timer = setTimeout(() => { child.kill(); resolve(); }, 1000);
        child.once('exit', () => { clearTimeout(timer); resolve(); });
      });
    }
  }
}
