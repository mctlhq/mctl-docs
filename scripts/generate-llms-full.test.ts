import { expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const script = join(import.meta.dir, 'generate-llms-full.ts')

function run(docs: string, out: string) {
  const p = Bun.spawnSync(['bun', 'run', script], {
    env: { ...process.env, LLMS_DOCS_DIR: docs, LLMS_OUTPUT_FILE: out },
  })
  return { code: p.exitCode, stderr: p.stderr.toString() }
}

function write(root: string, rel: string, body: string) {
  const p = join(root, rel)
  mkdirSync(join(p, '..'), { recursive: true })
  writeFileSync(p, body)
}

test('bundles markdown in order, excludes public/.vitepress/node_modules, ignores non-md', () => {
  const dir = mkdtempSync(join(tmpdir(), 'llms-'))
  const docs = join(dir, 'docs')
  write(docs, 'index.md', '# Home\n')
  write(docs, 'guides/b.md', 'BBB\n')
  write(docs, 'guides/a.md', 'AAA\n')
  write(docs, 'api.md', 'API\n')
  write(docs, 'public/skip.md', 'PUBLIC-SECRET')
  write(docs, '.vitepress/skip.md', 'VP-SECRET')
  write(docs, 'node_modules/skip.md', 'NM-SECRET')
  write(docs, 'notes.txt', 'TXT-SECRET')
  const out = join(dir, 'out', 'llms-full.txt')

  expect(run(docs, out).code).toBe(0)
  const text = readFileSync(out, 'utf8')

  expect(text).toContain('Total Files Included: 4')
  const order = ['/index.md', '/api.md', '/guides/a.md', '/guides/b.md'].map((f) => text.indexOf(`FILE: ${f}\n`))
  expect(order.every((i) => i >= 0)).toBe(true)
  expect([...order].sort((x, y) => x - y)).toEqual(order)
  for (const marker of ['PUBLIC-SECRET', 'VP-SECRET', 'NM-SECRET', 'TXT-SECRET']) {
    expect(text).not.toContain(marker)
  }
  expect(text).toContain('# Home')
  expect(text).toContain('AAA')
})

test('fails and writes nothing when the docs dir is unreadable', () => {
  const dir = mkdtempSync(join(tmpdir(), 'llms-'))
  const out = join(dir, 'llms-full.txt')
  const r = run(join(dir, 'missing'), out)
  expect(r.code).not.toBe(0)
  expect(existsSync(out)).toBe(false)
})
