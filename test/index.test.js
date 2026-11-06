import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as host from '../index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('dsh-mobile host exports correct plugin interface', () => {
  assert.equal(host.name, 'dsh-mobile');
  assert.equal(typeof host.apply, 'function');
});

test('dsh-mobile client bundle contains viewport lock and keyboard adaptations', () => {
  const clientCode = readFileSync(join(__dirname, '..', 'client.js'), 'utf8');
  assert.match(clientCode, /interactive-widget=resizes-content/);
  assert.match(clientCode, /overflow:\s*hidden/);
  assert.match(clientCode, /overscroll-behavior:\s*none/);
  assert.match(clientCode, /overscroll-behavior-y:\s*contain/);
  assert.match(clientCode, /visualViewport/);
});
