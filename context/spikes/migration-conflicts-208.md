# Spike: Git-clean merges that yield conflicting PostgreSQL migrations (mctlhq/mctl-docs#208)

Status: research only. Nothing in this note was executed. Every oracle below is
`NOT_RUN`. Refs #208; does not close it.

Base: `origin/main` at `0868e27809263719be66d8f340b08e3e4545a4d0` (fetched
2026-11-15). Branch: `docs/migration-conflicts-spike-208`.

## 1. Question

A merge can be conflict-free in Git and still produce a set of PostgreSQL
migrations that fails, or succeeds into a wrong schema. What belongs in
customer-facing guidance, and what belongs in implementer or CI checks?

## 2. Source status

| Source | Status |
|---|---|
| `AGENTS.md`, `context/plans/site-docs-alignment.md` at base | Read |
| `docs/guides/databases.md`, `rollbacks.md`, `services.md`, `reference/faq.md`, `reference/troubleshooting.md` at base | Read or grepped (see 3) |
| `.github/workflows/*`, `Dockerfile` at base | Name-listed; `git grep` for `migrat`, `.sql`, `schema` returned no hits. Contents not read in full |
| https://postgr.es/p/9Bm | Inaccessible per orchestrator; its contents are unknown and not relied on |
| PostgreSQL `CREATE INDEX` and `ALTER TABLE` docs (served as PG18) | Orchestrator-relayed summary only; not fetched here. `IF NOT EXISTS` only suppresses the same-name relation error and does not verify shape. `CREATE INDEX CONCURRENTLY` cannot run in a transaction block. `ADD COLUMN IF NOT EXISTS` exists, and type/default/nullability changes are available |
| Target PostgreSQL version of the shared CNPG cluster | **Unread/unknown.** Docs say only "PostgreSQL on the platform's shared CNPG cluster". Do not assume PG18 |
| mctl-api, mctl-gitops, mctl-agent, other repos | Not available locally. Unread. No cross-repo excerpt requested |
| gitops#1044, agents#918, gitops#2506 | Related pointers only, not proven owners (see 3.3) |
| mctl-api#1277 / T10 audit-chain concurrency | Separate. Not addressed here |

Note: a docs reference to `mctl-gitops#1277` exists
(`docs/human-input/agent-authors.md:23`) but concerns the investigator
profile, not migrations. The orchestrator's "issue1277" T10 is a different
subject; the number overlap is not evidence of relation.

## 3. Current state and duplicate map

### 3.1 What the published docs say (base `0868e27`)

- `docs/guides/databases.md:16-22,38-42`: provisioning creates a database and
  role on a shared CNPG PostgreSQL cluster; credentials arrive as `DB_*`
  variables. No mention of schema migration, who runs it, or when.
- `docs/guides/rollbacks.md:24-27`: rollback changes `image.tag` only; it
  "does not restore ... database state"; "configuration and schema recovery
  need separate changes".
- `docs/guides/services.md:55-56`: same boundary. `:61-63`: retirement can
  delete database resources; Git history is not a backup.
- `docs/reference/faq.md:48`: rollback does not restore database state.
- `docs/guides/scaffolding.md:36`: durable data belongs in a database.
- `docs/reference/troubleshooting.md:180-198`: provisioning and connectivity
  only.

### 3.2 Absent versus unread

Absent in this repo at base (by `git grep -i` over `docs`, `context`,
`.github`, `Dockerfile`): any guidance on migration tooling, migration
ordering, running migrations at deploy time, expand/contract compatibility,
backups before schema change, or a CI migration check. Absent is established
only for this checkout; whether the platform runs migrations for tenants, and
how mctl's own components do, is **unread** (lives in other repos).

Existing project practice for the platform's own database migrations: unread.

### 3.3 Duplicate and owner map

| Candidate | Relation | Verdict |
|---|---|---|
| gitops#1044 (KYAML canonicalization) | Semantic comparison of rendered config, not SQL | Related analogy only; owner unproven |
| agents#918 (deterministic finding validation) | Possible home for deterministic validators | Related pointer; owner unproven |
| gitops#2506 (Temporal JWT issuer) | Unrelated subject | Not a migration owner |
| Standalone migration proposal in this repo's `context/` | None found (`context/` holds only the alignment plan and ADR 0003) | Absent here. DevLoop-not-found is not proof of absence elsewhere |
| Open docs PR #206 | Dependency update | Unrelated |

No existing owner for migration-conflict guidance was found in this checkout.

## 4. Vocabulary: five different "successes"

A check that proves one level says nothing about the next.

1. **Git conflict**: textual overlap. Absent when branches add different files.
2. **Parser success**: each file is syntactically valid SQL.
3. **DDL apply success**: each statement executes without error against a
   specific starting schema and data.
4. **Final schema equivalence**: the resulting catalog matches the intended
   schema (columns, types, defaults, nullability, constraints, indexes).
5. **Application semantics**: old and new application code behave correctly on
   that schema and its data, during and after rollout.

## 5. Hypothetical examples

All SQL is invented for illustration. `A` and `B` are two feature branches
that each pass review and CI alone from the same base. Base schema:

```sql
-- base
CREATE TABLE accounts (id bigint PRIMARY KEY, email text);
```

The examples assume a tool that applies files in filename order and records
applied versions in a bookkeeping table. The actual tool is unknown.

### 5.1 Duplicate sequence identifiers

```text
-- branch A: migrations/0007_add_plan.sql
-- branch B: migrations/0007_add_region.sql
```

```sql
-- 0007_add_plan.sql (A)
ALTER TABLE accounts ADD COLUMN plan text NOT NULL DEFAULT 'free';
-- 0007_add_region.sql (B)
ALTER TABLE accounts ADD COLUMN region text;
```

- Git: no conflict (different filenames). Parser: ok.
- Outcome depends on the tool: error on duplicate version, silently skip the
  second file because version `0007` is already recorded, or apply both in
  name order. Skipping is the dangerous case: a database that has applied only
  A's `0007` never gets B's, while a clean install gets both.
- Oracle (NOT_RUN): tool reports a duplicate or the schema lacks `region`.

### 5.2 Same name, different shape

```sql
-- A
CREATE INDEX IF NOT EXISTS accounts_email_idx ON accounts (email);
-- B
CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_idx ON accounts (lower(email));
```

- A then B: B's statement succeeds as a no-op because a relation with that
  name exists; the intended unique, lower-cased index never exists, so
  any application relying on that uniqueness is unprotected.
- B then A: A's statement no-ops; the final index is the unique expression
  index, silently stricter than A intended.
- Per the relayed CREATE INDEX documentation, `IF NOT EXISTS` checks the name
  only, not the shape. Parser ok, DDL ok, schema equivalence fails.
- Same shape of problem with `ADD COLUMN IF NOT EXISTS`:

```sql
-- A
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS status text;
-- B
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS status integer;
```

  Whichever runs second is a no-op, so the column type depends on order.

### 5.3 Rename and drop dependencies

```sql
-- A
ALTER TABLE accounts RENAME COLUMN email TO contact_email;
-- B
CREATE INDEX accounts_email_lookup ON accounts (email);
```

- A then B: B fails with `column "email" does not exist`.
- B then A: succeeds; PostgreSQL updates the index to follow the rename.
  Order changes the verdict. Git: no conflict.

```sql
-- A
ALTER TABLE accounts DROP COLUMN email;
-- B
CREATE VIEW account_emails AS SELECT id, email FROM accounts;
```

- B then A: the drop fails because the view depends on the column (expected
  error class: dependent objects, hint to use `CASCADE`). A reflexive
  `CASCADE` fix would then drop B's view silently.

### 5.4 Data, default and NOT NULL failures

```sql
-- A
ALTER TABLE accounts ADD CONSTRAINT accounts_email_key UNIQUE (email);
-- B (data fix-up added by another branch)
INSERT INTO accounts (id, email) VALUES (2, 'dup@example.test');
```

- Empty database: both apply. A populated database already holding a
  duplicate email: A fails with a unique violation. Clean install passes;
  upgrade fails. Static review of A cannot see the data.

```sql
-- A
ALTER TABLE accounts ALTER COLUMN email SET NOT NULL;
-- B
ALTER TABLE accounts ALTER COLUMN email DROP NOT NULL;
```

- A then B ends nullable; B then A ends NOT NULL. Both apply cleanly in either
  order; only the final state differs. On a populated table with NULL emails,
  A fails with a not-null violation regardless of B.

```sql
-- A
ALTER TABLE accounts ALTER COLUMN email SET DEFAULT 'n/a';
-- B
ALTER TABLE accounts ALTER COLUMN email SET DEFAULT '';
```

- Last writer wins; no error either way.

### 5.5 Ordering divergence

If the tool orders by filename and A's file is `0008_a.sql` while B's is
`0008_b.sql` plus a later rebase renumbered one, then:

- Environment 1 (applied A first, then B merged later): history is A, B.
- Environment 2 (fresh install): files sorted, possibly B, A.
- Tools differ on whether a migration older than the latest applied version is
  applied, skipped, or rejected. Unknown for the mctl tooling.

Matrix of order effects, using 5.3 (rename vs index):

| Path | Result |
|---|---|
| Fresh install, A then B | fails (column missing) |
| Fresh install, B then A | ok |
| Existing DB at base, deploy A then later B | fails |
| Existing DB that already ran B, then A | ok |

### 5.6 Old and new application compatibility during deploy

```sql
-- A: contract step shipped together with the code change
ALTER TABLE accounts DROP COLUMN email;
ALTER TABLE accounts ADD COLUMN contact_email text NOT NULL;
```

During a rolling update both old and new pods run. Old pods query `email` and
fail; old pods that insert without `contact_email` fail on NOT NULL. Git
parser and DDL success say nothing about this window. The default chart uses
rolling updates (`docs/guides/services.md:72-74`), so such a window exists
unless blue-green is used, and blue-green does not by itself isolate a shared
database.

### 5.7 Rollback data-loss boundary

Platform rollback restores `image.tag` only (`rollbacks.md:24-27`). After the
migration in 5.6 has run, rolling back to the old tag reintroduces code that
expects `email`, which no longer exists. A "down" migration that re-adds
`email` cannot recover the dropped values. The boundary is the first
destructive or lossy statement: `DROP COLUMN`, `DROP TABLE`, a narrowing
`ALTER COLUMN ... TYPE`, `UPDATE`/`DELETE` backfills. Before that point an
image rollback may be safe; after it, only restore from backup is.

### 5.8 Bookkeeping, concurrency and transaction boundaries

- Bookkeeping: if the tool records a version before or outside the DDL
  transaction, a crash can leave "recorded but not applied" or "applied but not
  recorded". Which holds for mctl tooling is unknown.
- Serial vs concurrent runs: two pods both starting a migration runner may
  both attempt version `0007`. Without a lock (for example an advisory lock),
  one fails or both apply. Unknown for mctl.
- Transaction boundaries: PostgreSQL DDL is transactional, so a multi-statement
  file in one transaction rolls back wholly on error. Exceptions:

```sql
-- must NOT be inside a transaction block (relayed from CREATE INDEX docs)
CREATE INDEX CONCURRENTLY accounts_email_idx ON accounts (email);
```

  A failed `CONCURRENTLY` build can leave an `INVALID` index behind that a
  later `IF NOT EXISTS` run would treat as present. If a tool wraps every file
  in a transaction, the statement errors; if it splits, a file can be partially
  applied. Other statements with restrictions on transaction use exist
  (for example `ALTER TYPE ... ADD VALUE` in older versions); verify against the
  target version, not against PG18 docs.

## 6. Failure matrix (all oracles NOT_RUN)

Legend: Git / Parse / DDL / Schema / App.

| # | Scenario | Git | Parse | DDL (expected) | Schema equiv | App | SQL error expected | Oracle |
|---|---|---|---|---|---|---|---|---|
| 1 | Duplicate version id (5.1) | clean | ok | tool-defined | may fail | may fail | tool-specific, or none (silent skip) | catalog lists both columns; bookkeeping lists both files |
| 2 | Same-name index, different shape (5.2) | clean | ok | ok (no-op) | fails | fails | none | `pg_indexes.indexdef` equals intended text |
| 2b | `ADD COLUMN IF NOT EXISTS` different type | clean | ok | ok (no-op) | fails | fails | none | `information_schema.columns.data_type` |
| 3 | Rename vs new index on old name (5.3) | clean | ok | order-dependent | n/a | n/a | `column "email" does not exist` in A->B | exit status per order |
| 3b | Drop vs dependent view (5.3) | clean | ok | order-dependent | n/a | n/a | dependent-object error in B->A | exit status per order |
| 4 | Unique on populated duplicates (5.4) | clean | ok | fails on data | n/a | n/a | unique violation | run against seeded fixture |
| 4b | SET/DROP NOT NULL divergence | clean | ok | ok both | order-dependent | may fail | none (A on NULL rows: not-null violation) | `is_nullable` per order |
| 4c | Divergent defaults | clean | ok | ok | order-dependent | may differ | none | `column_default` per order |
| 5 | Ordering divergence, upgrade vs clean (5.5) | clean | ok | differs | differs | may differ | tool-specific | compare catalog dump of both paths |
| 6 | Old/new code during rolling deploy (5.6) | clean | ok | ok | ok | fails | application errors, not DDL | run old and new test suites on migrated schema |
| 7 | Rollback after lossy migration (5.7) | clean | ok | ok | ok | data loss | none | row counts and checksums pre/post |
| 8 | Bookkeeping crash window (5.8) | clean | ok | partial | may fail | may fail | tool-specific | kill runner mid-run in fixture |
| 9 | Concurrent runners (5.8) | clean | ok | tool-defined | may fail | may fail | tool-specific | two runners in fixture |
| 10 | `CONCURRENTLY` in transaction (5.8) | clean | ok | fails | n/a | n/a | cannot run inside a transaction block | exit status |

Each row compares A->B and B->A, and clean install versus upgrade, and an empty
versus a populated dataset. A schema-only diff covers none of rows 4, 6, 7, 8,
9.

## 7. Smallest disposable-PostgreSQL experiment (design only, NOT_RUN)

Constraints for this spike: no container start, no install, no network. The
design is for a later, separately approved run.

- Isolation: one throwaway local PostgreSQL instance of the same major version
  as the target cluster (version must be read from the cluster first; unknown
  today), bound to a unix socket or loopback, new empty data directory under a
  scratch path, one new database per scenario, a random superuser password not
  reused anywhere. No production, staging or tenant handles, DSNs or
  credentials in the environment. Fail closed if any `DB_*` or `DATABASE_URL`
  variable is set.
- Fixture: base schema from section 5, plus a seeded variant with a duplicate
  email, a NULL email and 1 000 rows. Files `A_*.sql`, `B_*.sql` in a scratch
  directory.
- Procedure per scenario: create database; load base (and seed if populated);
  apply A then B each in `psql --single-transaction -v ON_ERROR_STOP=1`; dump
  catalog (`pg_dump --schema-only`); drop the database; repeat B then A; diff
  the dumps. For rows 8 and 9, use the real migration tool, whose identity is
  unknown.
- Cleanup: drop each database after each scenario; stop the instance by the
  captured PID only; remove the scratch data directory; confirm no listening
  socket remains.
- Output: a table of exit status, error text, catalog diff and row checksums,
  filled in for every cell of section 6.

## 8. Negative and mutation test plan (design only)

For any future checker, prove it can fail before trusting it:

- Seed each section 5 pair and assert the checker flags it (negative tests).
  Include same-name different-shape pairs and order-dependent pairs.
- Mutation: weaken the checker (ignore index definition text, ignore order,
  drop the populated fixture) and require the corresponding test to fail.
- Control: a pair of independent migrations (different tables) must pass in
  both orders with equal catalogs, to bound false positives.
- Mutation per the bridge rules: commit first, edit, run, `git restore`,
  confirm clean.

## 9. Limits: cost, latency, data loss, false positives

No benchmark has been run; none is claimed.

- Cost and latency: unmeasured. A disposable-database check needs a PostgreSQL
  server and one apply per order per scenario; its cost scales with the number
  of migration pairs and the size of the fixture. Unknown for the real repos.
- Static grep or schema diff: can flag duplicate identifiers and same-name
  objects; cannot prove safe deployment. It does not see data, ordering
  semantics in the tool, old/new code compatibility, locks, or lossy
  statements.
- Dynamic order checks: only cover the data you seed. A pass on empty or small
  fixtures does not prove a pass on production-size data (unique violations,
  long locks, `CONCURRENTLY` behaviour).
- False positives: reorder-sensitive but harmless pairs (independent tables
  with a shared name prefix); intentional idempotent re-runs using
  `IF NOT EXISTS`. False negatives: anything data- or traffic-dependent.
- Data loss: the checks never replace backups; restore is the only recovery
  past a lossy statement.

## 10. Owner routing: docs vs component repo vs platform CI

| Concern | Owner | Why |
|---|---|---|
| What a rollback does and does not restore; "schema and data recovery are separate" | Docs (already published) | Customer-visible boundary; present at `rollbacks.md:24-27` |
| Customer rules: expand/contract, no destructive migration with the same release as code, back up before lossy change, same-name `IF NOT EXISTS` caveat | Docs (new guidance) | Applies to any tenant app, tool-agnostic |
| Duplicate id detection, ordering policy, shape-aware checks, bookkeeping and locking | Component repo that owns the migrations | Needs the actual tool, SQL files and schema; those are unread here |
| Shared check across component repos | Platform CI | Only after at least one component check proves value; needs separate approval and permissions |

## 11. Proposed disposition

**GUIDANCE_FIRST.**

Reason: the only owned surface in this repo is published documentation, and
it already states the rollback boundary but is silent on how customers should
write migrations that survive a Git-clean merge and a rolling deploy. The
component-side tooling and its transaction and ordering behaviour are unread,
so any enforcement proposal would be speculation. Guidance is tool-agnostic,
cheap, and reversible.

Minimal separately approvable paths:

1. Docs: add a short "Schema changes" section to `docs/guides/databases.md`
   (expand/contract, one lossy step per release, back up first, `IF NOT
   EXISTS` does not check shape, `CONCURRENTLY` cannot run in a transaction
   block, verify against your PostgreSQL version) and a one-sentence pointer in
   `docs/guides/rollbacks.md`. Separate PR; needs `llms-full.txt` regeneration
   per existing practice.
2. Later, only if the owner repo is identified: a bounded component check
   limited to duplicate identifiers and same-name object shape, with the
   section 8 negative tests.
3. No platform CI change, no automatic enforcement, no expanded CI
   permissions.

Not chosen: `BOUNDED_COMPONENT_CHECK` (owner and tooling unread), `DEFER`
(guidance gap is real and cheap to fill), `REJECT` (the failure modes in
section 5 are real in principle).

## 12. Gaps

- Target PostgreSQL major version of the shared CNPG cluster: unread.
- Migration tool, ordering, bookkeeping, locking and transaction behaviour of
  mctl components and tenants: unread.
- Whether any migration-related practice or issue exists in other repos:
  unread; no excerpt requested.
- Primary PostgreSQL pages: relayed, not fetched by this attempt.
- postgr.es/p/9Bm: inaccessible, contents unknown.
- All experiments: NOT_RUN.
