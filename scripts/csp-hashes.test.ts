import { expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const script = join(import.meta.dir, 'csp-hashes.ts')
const nginxConf = join(import.meta.dir, '..', 'nginx.conf')

const sha = (body: string) => `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`

function run(dist: string, out: string) {
  const p = Bun.spawnSync(['bun', 'run', script], {
    env: { ...process.env, CSP_DIST_DIR: dist, CSP_OUT_FILE: out },
  })
  return { code: p.exitCode, stderr: p.stderr.toString() }
}

function fixture(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'csp-'))
  const dist = join(dir, 'dist')
  for (const [name, html] of Object.entries(files)) {
    const path = join(dist, name)
    mkdirSync(join(path, '..'), { recursive: true })
    writeFileSync(path, html)
  }
  mkdirSync(dist, { recursive: true })
  return { dist, out: join(dir, 'hashes.txt') }
}

test('hashes inline scripts from nested pages, skips src= scripts', () => {
  const a = 'window.a=1'
  const b = 'window.b=2'
  const { dist, out } = fixture({
    'index.html': `<script>${a}</script><script src="/x.js"></script>`,
    'guides/page.html': `<script type="module">${b}</script>`,
  })
  expect(run(dist, out).code).toBe(0)
  const line = readFileSync(out, 'utf8').trim()
  expect(line.split(' ').sort()).toEqual([sha(a), sha(b)].sort())
})

test('fails on a dist with no HTML (unobserved is not empty)', () => {
  const { dist, out } = fixture({})
  const r = run(dist, out)
  expect(r.code).not.toBe(0)
  expect(r.stderr).toContain('no HTML')
})

test('fails when HTML has no inline scripts', () => {
  const { dist, out } = fixture({ 'index.html': '<script src="/x.js"></script>' })
  const r = run(dist, out)
  expect(r.code).not.toBe(0)
  expect(r.stderr).toContain('no inline scripts')
})

test('fails when the dist directory is missing', () => {
  const { out } = fixture({})
  expect(run(join(out, '..', 'nope'), out).code).not.toBe(0)
})

test('rendered nginx.conf has hashes in CSP and no placeholder left', () => {
  const { dist, out } = fixture({ 'index.html': '<script>window.a=1</script>' })
  expect(run(dist, out).code).toBe(0)
  const hashes = readFileSync(out, 'utf8').trim()
  expect(hashes).toContain("'sha256-")

  // Same substitution the Dockerfile performs.
  const rendered = readFileSync(nginxConf, 'utf8').replaceAll('__SCRIPT_SRC_HASHES__', hashes)
  expect(rendered).not.toContain('__SCRIPT_SRC_HASHES__')
  const csp = rendered.split('\n').find((l) => l.includes('Content-Security-Policy'))
  expect(csp).toBeDefined()
  expect(csp).toContain(`script-src 'self' https://stats.mctl.ai ${hashes};`)
  expect(csp).not.toContain("script-src 'self' https://stats.mctl.ai ;")
})

test('nginx.conf template still carries the placeholder inside script-src', () => {
  const csp = readFileSync(nginxConf, 'utf8').split('\n').find((l) => l.includes('Content-Security-Policy'))
  expect(csp).toContain('script-src')
  expect(csp).toContain('__SCRIPT_SRC_HASHES__')
})
