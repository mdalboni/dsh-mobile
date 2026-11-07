import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as host from '../index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgDir = join(__dirname, '..');

test('dsh-mobile host exports correct plugin interface', () => {
  assert.equal(host.name, 'dsh-mobile');
  assert.equal(typeof host.apply, 'function');
  // Call apply with a dummy context to ensure it runs without throwing
  assert.doesNotThrow(() => host.apply({}));
});

test('dsh-mobile client bundle contains viewport lock, keyboard, and sidebar auto-retract adaptations', () => {
  const clientCode = readFileSync(join(pkgDir, 'client.js'), 'utf8');

  // Module loader registration
  assert.match(clientCode, /window\.__ModuleLoader__\.load/);
  assert.match(clientCode, /id:\s*['"]dsh-mobile['"]/);

  // Virtual keyboard interactive-widget adaptation
  assert.match(clientCode, /interactive-widget=resizes-content/);

  // Scroll clamping
  assert.match(clientCode, /window\.scrollTo\(0,\s*0\)/);

  // Viewport lock CSS
  assert.match(clientCode, /html,\s*body\s*\{[^}]*overflow:\s*hidden\s*!important/s);
  assert.match(clientCode, /overscroll-behavior:\s*none\s*!important/);

  // Scroll container overscroll containment
  assert.match(clientCode, /\[data-conversation-scroll\]\s*\{[^}]*overscroll-behavior-y:\s*contain\s*!important/s);

  // Input zoom prevention (16px font-size)
  assert.match(clientCode, /font-size:\s*16px\s*!important/);

  // Sidebar auto-retract logic on mobile
  assert.match(clientCode, /data-sidebar-collapsed/);
  assert.match(clientCode, /button\[data-sidebar-toggle\]/);
  assert.match(clientCode, /toggleSidebar/);
  assert.match(clientCode, /max-width:\s*768px/);
});

test('dsh-mobile package.json satisfies bundle manifest guidelines', () => {
  const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));

  assert.equal(pkg.name, 'dsh-mobile');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.dsh?.bundle?.patch, './cordis.patch.yml');
  assert.equal(pkg.dsh?.client?.platform, 'web');
  assert.equal(pkg.dsh?.client?.immediately, true);

  // Required exports
  assert.equal(pkg.exports?.['.'], './index.js');
  assert.equal(pkg.exports?.['./client'], './client.js');
  assert.equal(pkg.exports?.['./icon'], './icon.svg');
  assert.equal(pkg.exports?.['./locale/*.json'], './locale/*.json');

  // Files whitelist entries exist on disk
  for (const file of pkg.files) {
    if (file.includes('*')) continue;
    assert.ok(existsSync(join(pkgDir, file)), `File in files whitelist must exist: ${file}`);
  }
});

test('dsh-mobile cordis.patch.yml defines correct bundle insertion', () => {
  const patchContent = readFileSync(join(pkgDir, 'cordis.patch.yml'), 'utf8');
  assert.match(patchContent, /- insert:/);
  assert.match(patchContent, /id:\s*dsh-mobile/);
  assert.match(patchContent, /name:\s*dsh-mobile/);
});

test('dsh-mobile locale files provide localized metadata', () => {
  const locales = ['en', 'pt-BR', 'zh'];
  for (const lang of locales) {
    const locPath = join(pkgDir, 'locale', `${lang}.json`);
    assert.ok(existsSync(locPath), `Locale file must exist: ${lang}.json`);
    const data = JSON.parse(readFileSync(locPath, 'utf8'));
    assert.ok(data.meta?.title, `Locale ${lang} missing meta.title`);
    assert.ok(data.meta?.description, `Locale ${lang} missing meta.description`);
  }
});

test('dsh-mobile artwork, screenshots, and visual assets exist and are valid', () => {
  const iconSvg = join(pkgDir, 'icon.svg');
  assert.ok(existsSync(iconSvg), 'icon.svg must exist');
  assert.ok(readFileSync(iconSvg, 'utf8').includes('<svg'));

  const icon180 = join(pkgDir, 'assets', 'icon-180.png');
  assert.ok(existsSync(icon180), 'assets/icon-180.png must exist');
  assert.ok(readFileSync(icon180).length > 100);

  const screenshots = [
    'screenshot-chat-view.jpg',
    'screenshot-keyboard-open.jpg',
    'screenshot-sidebar-open.jpg',
  ];
  for (const s of screenshots) {
    const p = join(pkgDir, 'assets', s);
    assert.ok(existsSync(p), `${s} must exist`);
    assert.ok(readFileSync(p).length > 1000, `${s} must not be empty`);
  }

  // screenshots.json manifest
  const manifestPath = join(pkgDir, 'screenshots.json');
  assert.ok(existsSync(manifestPath), 'screenshots.json must exist');
  const declared = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.ok(Array.isArray(declared) && declared.length >= 1);
  for (const rel of declared) {
    assert.ok(existsSync(join(pkgDir, rel)), `Declared screenshot must exist: ${rel}`);
  }
});

test('dsh-mobile marketplace submission manifest is valid', () => {
  const specPath = join(pkgDir, 'mdalboni__dsh-mobile.yml');
  assert.ok(existsSync(specPath), 'mdalboni__dsh-mobile.yml must exist');
  const content = readFileSync(specPath, 'utf8');
  assert.match(content, /url:\s*https:\/\/github\.com\/mdalboni\/dsh-mobile/);
  assert.match(content, /name:\s*mdalboni\/dsh-mobile/);
  assert.match(content, /category:\s*ui/);
  assert.match(content, /icon:\s*https:\/\/raw\.githubusercontent\.com/);
});
