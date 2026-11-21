# Spike: Git-clean merges that yield conflicting PostgreSQL migrations (mctlhq/mctl-docs#208)

Status: research only. Nothing in this note was executed. Every oracle and every
result below is `NOT_RUN`. Disposition is proposed only; this note grants no
implementation authority. Refs #208; does not close it.

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
| mctlhq/mctl-telegram#1277 / T10 audit-chain | Separate subject. Not addressed here, not read |

Note on issue numbers: the T10 audit-chain reference is
`mctlhq/mctl-telegram#1277`. It is not `mctl-api#1277`; an earlier revision of
this note had the wrong repository and that is corrected. Separately, a docs
reference to `mctl-gitops#1277` exists (`docs/human-input/agent-authors.md:23`)
but concerns the investigator profile, not migrations. Number overlap between
these is not evidence of relation, and neither is claimed related to
migration conflicts.

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
| Standalone migration proposal in this repo's `context/` | None found (`context/` holds only the alignment plan and ADR 0003) | Absent here. Not-found locally is not proof of absence elsewhere |
| Open docs PR #206 | Dependency update | Unrelated |

No existing owner for migration-conflict guidance was found in this checkout.

## 4. Vocabulary: five different "successes"

A check that proves one level says nothing about the next.

1. **Git conflict**: textual overlap. Absent when branches add different files.
2. **Parser success**: each file is syntactically valid SQL.
3. **DDL apply success**: each statement executes without error against a
   specific starting schema, data and transaction mode.
4. **Final schema equivalence**: the resulting catalog is semantically the
   intended schema (see section 7.4 for what "semantically" must mean).
5. **Application semantics**: old and new application code behave correctly on
   that schema and its data, during and after rollout.

## 5. Hypothetical examples

All SQL is invented for illustration. `A` and `B` are two feature branches
that each pass review and CI alone from the same base. Base schema:

```sql
-- base
CREATE TABLE accounts (id bigint PRIMARY KEY, email text);
```

Assumptions stated once, and restated per result below:

- Initial data: unless a result says otherwise, the base table is **empty**.
  "Populated" means rows exist, possibly including NULL or duplicate `email`.
- Transactions: unless a result says otherwise, each file runs in a single
  transaction. Whether the real tool does so is unknown.
- The examples assume a tool that applies files in filename order and records
  applied versions in a bookkeeping table. The actual tool is unknown.
- Every "result" is a hypothesis derived from the relayed documentation and
  general PostgreSQL behaviour. All are `NOT_RUN`.

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

- Data assumption: empty or populated both apply (the NOT NULL column has a
  default). Transaction assumption: irrelevant to the outcome here.
- Git: no conflict (different filenames). Parser: ok.
- Outcome depends on the tool: error on duplicate version, silently skip the
  second file because version `0007` is already recorded, or apply both in
  name order. Skipping is the dangerous case: a database that has applied only
  A's `0007` never gets B's, while a clean install gets both. Tool behaviour is
  UNKNOWN; plain `psql` cannot show it (section 7).
- Oracle (NOT_RUN): tool reports a duplicate, or the catalog lacks `region`.

### 5.2 Same name, different shape

```sql
-- A
CREATE INDEX IF NOT EXISTS accounts_email_idx ON accounts (email);
-- B
CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_idx ON accounts (lower(email));
```

- Data assumption: empty base. (On a populated table holding emails that
  collide after `lower()`, B alone would fail when it actually builds the
  index; with A first it is a no-op and would not fail.)
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

  Whichever runs second is a no-op, so the column type depends on order
  (any data assumption: no rows are touched).

### 5.3 Rename and drop dependencies

```sql
-- A
ALTER TABLE accounts RENAME COLUMN email TO contact_email;
-- B
CREATE INDEX accounts_email_lookup ON accounts (email);
```

- Data assumption: independent of data; empty base suffices.
- A then B: B fails with `column "email" does not exist`.
- B then A: succeeds; PostgreSQL updates the index to follow the rename.
  Order changes the verdict. Git: no conflict.

```sql
-- A
ALTER TABLE accounts DROP COLUMN email;
-- B
CREATE VIEW account_emails AS SELECT id, email FROM accounts;
```

Both orders are explicit (empty base; data does not change the outcome):

- A then B: A succeeds (no dependent object yet), then B fails with
  `column "email" does not exist`.
- B then A: A fails because the view depends on the column (expected error
  class: dependent objects, hint to use `CASCADE`). A reflexive `CASCADE`
  fix would then drop B's view silently.

Both orders fail, with different errors at different statements. This is a
genuine conflict, not an ordering problem.

### 5.4 Data, default and NOT NULL failures

```sql
-- A
ALTER TABLE accounts ADD CONSTRAINT accounts_email_key UNIQUE (email);
-- B (data fix-up added by another branch)
INSERT INTO accounts (id, email) VALUES (2, 'dup@example.test');
```

- Empty base database: both apply in either order, provided id 2 and the
  email are not already present. Populated base already holding the email
  `dup@example.test`: A fails with a unique violation if it runs after the
  duplicate exists; B alone inserts a second copy, which fails only if A's
  constraint is already in place. Clean install passes; upgrade may fail.
  Static review of A cannot see the data.

```sql
-- A
ALTER TABLE accounts ALTER COLUMN email SET NOT NULL;
-- B
ALTER TABLE accounts ALTER COLUMN email DROP NOT NULL;
```

- Empty base: A then B ends nullable; B then A ends NOT NULL. Both apply
  cleanly in either order; only the final state differs.
- Populated base with NULL emails: A fails with a not-null violation in
  either order (under B then A, B has no effect on the NULL rows).

```sql
-- A
ALTER TABLE accounts ALTER COLUMN email SET DEFAULT 'n/a';
-- B
ALTER TABLE accounts ALTER COLUMN email SET DEFAULT '';
```

- Either data assumption: last writer wins; no error either way.

### 5.5 Ordering divergence

If the tool orders by filename and A's file is `0008_a.sql` while B's is
`0008_b.sql` plus a later rebase renumbered one, then:

- Environment 1 (applied A first, then B merged later): history is A, B.
- Environment 2 (fresh install): files sorted, possibly B, A.
- Tools differ on whether a migration older than the latest applied version is
  applied, skipped, or rejected. Unknown for the mctl tooling.

Matrix of order effects, using 5.3 (rename vs index; empty base):

| Path | Result |
|---|---|
| Fresh install, A then B | fails (column missing) |
| Fresh install, B then A | ok |
| Existing DB at base, deploy A then later B | fails |
| Existing DB that already ran B, then A | ok |

### 5.6 Old and new application compatibility during deploy

Two variants, kept separate. Both share the migration text:

```sql
-- A: contract step shipped together with the code change
ALTER TABLE accounts DROP COLUMN email;
ALTER TABLE accounts ADD COLUMN contact_email text NOT NULL;
```

- **Empty base, single transaction:** the DDL succeeds (a NOT NULL column
  without a default can be added to a table with no rows). Old pods then
  query `email`, which is gone, and fail; old pods that insert without
  `contact_email` fail on NOT NULL. DDL success says nothing about this
  window.
- **Populated base:** the second statement fails
  (`column "contact_email" ... contains null values`), because existing rows
  cannot satisfy NOT NULL without a default. In a single transaction the whole
  file rolls back, including the DROP; the schema is unchanged. If the tool
  runs statements outside one transaction, the DROP may already have been
  applied and the data in `email` discarded. Which holds is unknown.

The default chart uses rolling updates (`docs/guides/services.md:72-74`), so
an old/new window exists unless blue-green is used, and blue-green does not by
itself isolate a shared database.

New constraints, defaults and writes can break old application code even
before any `DROP`: for example a new NOT NULL column or CHECK constraint
rejects old inserts, and a changed default or a trigger alters what old
writes store. Compatibility therefore needs a matrix (section 9), not only a list
of destructive statements.

### 5.7 Recovery boundary after destructive or lossy changes

Platform rollback restores `image.tag` only (`rollbacks.md:24-27`). Two
different recovery problems must not be conflated:

1. **Discarded original values.** `DROP COLUMN`, `DROP TABLE`, a narrowing
   `ALTER COLUMN ... TYPE`, and `UPDATE`/`DELETE` backfills can destroy values
   that a "down" migration cannot recreate. Recovery here requires
   preserved data (for example a retained copy or shadow column), a backup,
   point-in-time recovery, or a source from which the values can be
   reconstructed. Whether any of these exist for a given tenant database is
   **unknown** from this checkout; no recovery is guaranteed without evidence
   that the chosen mechanism exists and has been restored successfully.
2. **Schema or application incompatibility.** A rollback to an old image that
   expects a schema shape the migration removed or changed may be repairable by
   a reviewed forward or compensating migration, if no data was discarded (for
   example re-adding a nullable column the old code reads). This is a
   separate change, per the existing docs, and its correctness is not implied.

A restore is not claimed to be the only recovery in general; it is one
mechanism for case 1 when preserved data is absent. Equally, no point is
claimed at which an image rollback is generally safe: that depends on the
compatibility matrix (section 9), including constraint, default and write changes
that precede any lossy statement.

### 5.8 Bookkeeping, concurrency and transaction boundaries

Data assumption: independent of data unless stated.

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

  Inside a transaction block this statement errors (negative case 10a);
  outside one it should succeed (control 10b). A failed `CONCURRENTLY` build
  can leave an `INVALID` index behind (10c) that a later `IF NOT EXISTS` run
  would treat as present by name. If a tool wraps every file in a transaction,
  the statement errors; if it splits, a file can be partially applied. Other
  statements with restrictions on transaction use exist (for example
  `ALTER TYPE ... ADD VALUE` in older versions); verify against the target
  version, not against PG18 docs.

## 6. Failure matrix (all results NOT_RUN)

Legend: Git / Parse / DDL / Schema / App. Data column states the assumed
starting data; transaction mode is single-transaction per file unless noted.

| # | Scenario | Data | Git | Parse | DDL (expected) | Schema equiv | App | SQL error expected | Oracle |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Duplicate version id (5.1) | either | clean | ok | tool-defined | may fail | may fail | tool-specific, or none (silent skip) | catalog lists both columns; bookkeeping lists both files (needs real runner) |
| 2 | Same-name index, different shape (5.2) | empty | clean | ok | ok (no-op) | fails | fails | none | semantic index projection (7.4) |
| 2b | `ADD COLUMN IF NOT EXISTS` different type | empty | clean | ok | ok (no-op) | fails | fails | none | semantic column projection (7.4) |
| 3 | Rename vs new index on old name (5.3) | empty | clean | ok | order-dependent | n/a | n/a | `column "email" does not exist` in A->B | exit status per order |
| 3b | Drop vs dependent view (5.3) | empty | clean | ok | fails in both orders | n/a | n/a | A->B: missing column in B; B->A: dependent-object error in A | exit status and error per order |
| 4 | Unique on populated duplicates (5.4) | populated, duplicate | clean | ok | fails on data | n/a | n/a | unique violation | seeded fixture |
| 4b | SET/DROP NOT NULL divergence | empty: both ok; populated NULL: A fails | clean | ok | see data | order-dependent (empty) | may fail | none (empty); not-null violation (populated NULL) | `is_nullable` per order |
| 4c | Divergent defaults | either | clean | ok | ok | order-dependent | may differ | none | `column_default` per order |
| 5 | Ordering divergence, upgrade vs clean (5.5) | empty | clean | ok | differs | differs | may differ | tool-specific | needs real runner; compare semantic projections of both paths |
| 6a | Drop old + add NOT NULL new, no default (5.6) | empty | clean | ok | ok | ok | old app fails | application errors | old and new queries on migrated schema |
| 6b | Same, populated (5.6) | populated | clean | ok | fails on second statement | n/a (rolled back if single transaction) | n/a | null-values error | seeded fixture |
| 7 | Lossy change then image rollback (5.7) | populated | clean | ok | ok | ok | discarded values unrecoverable absent preserved data | none | row checksums pre/post; recovery rehearsal |
| 8 | Bookkeeping crash window (5.8) | either | clean | ok | partial | may fail | may fail | tool-specific | needs real runner; UNKNOWN until then |
| 9 | Concurrent runners (5.8) | either | clean | ok | tool-defined | may fail | may fail | tool-specific | needs real runner; UNKNOWN until then |
| 10a | `CONCURRENTLY` inside transaction (negative) | empty | clean | ok | fails | n/a | n/a | cannot run inside a transaction block | exit status |
| 10b | `CONCURRENTLY` outside transaction (control) | empty | clean | ok | ok | ok | ok | none | index valid in catalog |
| 10c | Failed concurrent build leaves INVALID index | populated, duplicates with UNIQUE | clean | ok | fails, leaves invalid index | fails until repaired | may fail | unique violation | catalog validity flag; recovery plan in 7.3 |
| P1 | Independent migrations, different tables (positive control) | either | clean | ok | ok both orders | equal | ok | none | equal semantic projections both orders |
| P2 | Genuinely equivalent idempotent rerun (positive control) | either | clean | ok | ok | equal | ok | none | same shape repeated with `IF NOT EXISTS` yields identical projection |

Each row, where meaningful, compares A->B and B->A, clean install versus
upgrade, and an empty versus a populated dataset. A schema-only comparison
covers none of rows 4, 6, 7, 8, 9. Not every pair is expected to be rejected;
P1 and P2 must pass.

## 7. Smallest disposable-PostgreSQL experiment (design only, NOT_RUN)

Constraints for this spike: no container start, no install, no database
execution, no network. The design is for a later, separately approved run.

### 7.1 Isolation

One throwaway local PostgreSQL instance of the same major version and
relevant settings as the target cluster (version must be read from the cluster
first; unknown today), bound to a unix socket or loopback, new empty data
directory under a scratch path, one new database per scenario, a random
superuser password not reused anywhere. No production, staging or tenant
handles, DSNs or credentials in the environment. Fail closed if any `DB_*` or
`DATABASE_URL` variable is set.

Fixture: base schema from section 5 in an empty variant, plus a seeded
variant with a duplicate email, a NULL email and 1 000 rows. Files `A_*.sql`,
`B_*.sql` in a scratch directory.

### 7.2 Part 1: transactional A/B (plain psql is sufficient)

Per scenario: create database; load base (and seed if populated); apply A then
B each with `psql --single-transaction -v ON_ERROR_STOP=1`; capture the
semantic projection (7.4); drop the database; repeat B then A; compare.
Covers rows 2, 2b, 3, 3b, 4, 4b, 4c, 6a, 6b, P1, P2 and the schema side of 7.
Record exit status, error text, projection and row checksums for each order.

### 7.3 Part 2: CONCURRENTLY cases (separate runs, not a single A/B)

- **10a negative:** run `CREATE INDEX CONCURRENTLY` inside a transaction block
  (`--single-transaction` or explicit `BEGIN`). The statement is deliberately
  invalid there; assert the expected error and that no index remains.
- **10b control:** run the same statement outside any transaction block;
  assert success and a valid index.
- **10c failed-build inspection:** with duplicate data, build a UNIQUE index
  concurrently outside a transaction so it fails; inspect whether an invalid
  index remains (catalog validity flag). Document the recovery plan: drop the
  invalid index and rebuild after fixing data, and note that a rerun with
  `IF NOT EXISTS` would see the leftover name and no-op without verifying
  validity. The recovery plan itself must be reviewed by the owner before
  being recommended to anyone.

### 7.4 Semantic schema comparison (replaces text equality)

A raw `pg_dump` diff or `pg_indexes.indexdef` text equality is **not**
semantic schema equivalence: it is sensitive to object ordering, owner and
tablespace metadata, internally-assigned names and OIDs, and formatting, and it
can differ for equivalent schemas or match for non-equivalent ones. Proposed
instead a normalized catalog projection, produced under a controlled PostgreSQL
major version and settings, with irrelevant metadata excluded (OIDs, owner,
privileges unless relevant, comments, statistics, storage parameters unless
relevant, auto-generated constraint or index names unless names matter to the
application). Projection columns, sorted deterministically:

- Columns: table, column name, resolved type (with modifiers), default
  expression, nullability, identity/generated attributes.
- Constraints: table, kind (primary, unique, foreign key, check, exclusion),
  column list or normalized expression, referenced table/columns and actions,
  deferrability.
- Indexes: table, uniqueness, method, key columns or normalized expressions,
  predicate, included columns, and validity flag (`indisvalid`, `indisready`).
- Views, triggers, functions and enum labels as needed, if in scope.

The projection answers level 4 only. It must be accompanied by separate
assertions: row checksums or an explicit data oracle for data-affecting
migrations, and the old and new application queries run against the migrated
schema (level 5). The migration tool, the real targets and the owner's
required projection fields remain **unknown** and must be retained as such.

### 7.5 Part 3: tool-specific rows need the real runner

Plain `psql` cannot validate version bookkeeping, locking, ordering policy or
crash windows (rows 1, 5, 8, 9). Those require the actual migration runner in
an isolated environment. Until then these rows stay `UNKNOWN`, not
inferred from psql behaviour. For 8, kill the runner mid-run in the fixture; for
9, start two runners.

Cleanup: drop each database after each scenario; stop the instance by the
captured PID only; remove the scratch data directory; confirm no listening
socket remains.

Output: a table of exit status, error text, semantic projection result and
row checksums for each cell of section 6, with `UNKNOWN` where the runner was
not available.

## 8. Negative and mutation test plan (design only)

For any future checker, prove it can fail before trusting it:

- Negative tests: seed each section 5 pair and assert the checker flags the
  ones that are genuine conflicts (5.2, 5.3, 5.4 populated, 5.6b), including
  same-name different-shape and order-dependent pairs.
- Positive controls: P1 (independent migrations, different tables) must pass
  in both orders with equal projections; P2 (a genuinely equivalent idempotent
  rerun) must pass. Not every A/B pair is expected to be rejected; a checker
  that rejects all pairs fails these controls.
- Mutation: weaken the checker (ignore index predicate or expression, ignore
  order, drop the populated fixture, compare text instead of the projection)
  and require the corresponding test to fail.
- Mutation per the bridge rules: commit first, edit, run, `git restore`,
  confirm clean.

## 9. Expand/contract compatibility matrix and data-retention plan

No release quota (such as "one lossy step per release") is asserted; none is
supported by evidence here. Instead, guidance should require an
owner-reviewed expand/contract compatibility matrix and a data-retention and
recovery plan for each schema-changing release:

| Step | Old app on new schema | New app on old schema | Data discarded? | Recovery evidence |
|---|---|---|---|---|
| Each migration or release step, filled by the owner | compatible / breaks (constraints, defaults, writes, reads) | compatible / breaks | none / which values | preserved copy, backup, PITR, reconstructable source, or compensating forward migration; and whether it was rehearsed |

The matrix must cover new constraints, defaults, triggers and writes, not only
`DROP`. The recovery column records evidence, not intent. Where evidence is
absent, the entry is `UNKNOWN`, not "recoverable".

## 10. Limits: cost, latency, data loss, false positives

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
  `IF NOT EXISTS` (P2). False negatives: anything data- or traffic-dependent.
- Data loss: checks never replace a data-retention and recovery plan.
  Recovery of discarded values depends on evidence of preserved data, backup,
  PITR or a reconstructable source, which is unknown here.

## 11. Owner routing: docs vs component repo vs platform CI

| Concern | Owner | Why |
|---|---|---|
| What a rollback does and does not restore; "schema and data recovery are separate" | Docs (already published) | Customer-visible boundary; present at `rollbacks.md:24-27` |
| Customer rules: expand/contract matrix, data-retention and recovery plan before lossy change, same-name `IF NOT EXISTS` caveat | Docs (new guidance), owner-reviewed | Applies to any tenant app, tool-agnostic |
| Duplicate id detection, ordering policy, shape-aware checks, bookkeeping and locking | Component repo that owns the migrations | Needs the actual tool, SQL files and schema; those are unread here |
| Shared check across component repos | Platform CI | Only after at least one component check proves value; needs separate approval and permissions |

## 12. Proposed disposition

**GUIDANCE_FIRST** (proposed; no implementation authority is granted by this
note).

Reason: the only owned surface in this repo is published documentation, and
it already states the rollback boundary but is silent on how customers should
write migrations that survive a Git-clean merge and a rolling deploy. The
component-side tooling and its transaction and ordering behaviour are unread,
so any enforcement proposal would be speculation. Guidance is tool-agnostic,
cheap, and reversible.

Minimal separately approvable paths:

1. Docs: add a short "Schema changes" section to `docs/guides/databases.md`
   (expand/contract compatibility matrix, data-retention and recovery plan,
   `IF NOT EXISTS` does not check shape, `CONCURRENTLY` cannot run in a
   transaction block, verify against your PostgreSQL version) and a
   one-sentence pointer in `docs/guides/rollbacks.md`. Separate PR; needs
   `llms-full.txt` regeneration per existing practice.
2. Later, only if the owner repo is identified: a bounded component check
   limited to duplicate identifiers and same-name object shape, using the
   section 7.4 projection and the section 8 tests.
3. No platform CI change, no automatic enforcement, no expanded CI
   permissions.

Not chosen: `BOUNDED_COMPONENT_CHECK` (owner and tooling unread), `DEFER`
(guidance gap is real and cheap to fill), `REJECT` (the failure modes in
section 5 are real in principle).

## 13. Gaps

- Target PostgreSQL major version and settings of the shared CNPG cluster:
  unread.
- Migration tool, ordering, bookkeeping, locking and transaction behaviour of
  mctl components and tenants: unread.
- Backup, PITR and restore capability for tenant databases: unread.
- Whether any migration-related practice or issue exists in other repos:
  unread; no excerpt requested.
- Primary PostgreSQL pages: relayed, not fetched by this attempt.
- postgr.es/p/9Bm: inaccessible, contents unknown.
- All experiments and results: NOT_RUN.
