# Test Coverage Analysis

**Date:** 2026-02-06
**Test suite:** 909 test files, 5996 tests (5988 passed, 5 failed, 3 skipped)
**Coverage thresholds:** 70% lines/functions/statements, 55% branches

## Current State

The codebase has ~1,487 source files and ~866 test files (58% file-level coverage).
Many integration surfaces are intentionally excluded from coverage enforcement
(CLI wiring, channel implementations, interactive UIs, gateway protocol) because
they are validated via manual or e2e flows.

Within the enforced coverage boundary, the project meets its 70% threshold. The
gaps below represent areas where adding tests would have the highest impact on
reliability and security.

---

## Priority 1: Security Module (0% tested)

All three files in `src/security/` lack unit tests. These are security-critical.

### `src/security/audit-fs.ts`
- Cross-platform file permission auditing (POSIX + Windows)
- Functions: `inspectPathPermissions()`, `isWorldWritable()`, `isGroupWritable()`,
  `modeBits()`, `formatPermissionRemediation()`
- **Risk:** Bit-mask logic (0o777) errors could miss world-writable files
- **Recommended tests:** Permission bit extraction, symlink handling, platform
  dispatch, remediation command generation

### `src/security/windows-acl.ts`
- Windows ACL parsing from `icacls` output
- Functions: `parseIcaclsOutput()`, `classifyPrincipal()`, `rightsFromTokens()`
- **Risk:** Malformed icacls output could bypass security classification
- **Recommended tests:** Token parsing edge cases, principal classification,
  unknown ACL entries, reset command generation

### `src/security/audit-extra.ts`
- Extended security audit: OAuth, sandbox, tool policies, auth profiles
- Functions: `expandTilde()`, tool policy validation via `isToolAllowedByPolicies()`
- **Risk:** Config parsing (JSON5), tilde expansion, tool allowlist enforcement
- **Recommended tests:** Path expansion, JSON5 depth limits, OAuth directory
  permission checks, tool policy matching

---

## Priority 2: Config Core (io, validation, migrations)

### `src/config/io.ts` (616 lines, untested)
- Config file loading, JSON5 parsing, backup rotation, SHA256 hashing
- Functions: `parseConfigJson5()`, `resolveConfigSnapshotHash()`, `loadConfig()`
- **Risk:** Backup rotation could cause data loss; env variable substitution
  could expose secrets
- **Recommended tests:** JSON5 parse errors, backup rotation (>5 backups),
  hash consistency, env substitution with missing vars

### `src/config/validation.ts` (362 lines, untested)
- Config validation, avatar path traversal prevention, plugin schema validation
- Functions: `validateConfigObject()`, avatar path validation, legacy detection
- **Risk:** Path traversal via `../` in avatar paths; plugin schema injection
- **Recommended tests:** Path escape attempts, HTTP/data URI avatars, duplicate
  agent detection, plugin validation errors

### `src/config/defaults.ts` (469 lines, untested)
- Default value application, model alias resolution, cost calculations
- Functions: `applyAgentDefaults()`, `applyModelDefaults()`,
  `applySessionDefaults()`
- **Risk:** Cascading defaults could produce invalid configs; alias resolution
  mistakes affect billing
- **Recommended tests:** Nested merge with undefined values, model alias
  resolution ("opus" -> "claude-opus-4-5"), partial config inputs

### `src/config/legacy.migrations.part-{1,2,3}.ts` (984 lines total, untested)
- Sequential config transformations for version upgrades
- **Risk:** Incorrect migration = user data loss on upgrade
- **Recommended tests:** Each migration in isolation, full pipeline, idempotency
  (applying twice should be safe), partial/missing fields

### `src/config/merge-patch.ts` (28 lines, untested)
- Recursive merge-patch algorithm used throughout config system
- **Risk:** Null-as-delete semantics must be precise; array handling matters
- **Recommended tests:** Deep nesting, null deletion, array replacement,
  type preservation

---

## Priority 3: Routing and Session Keys

### `src/routing/session-key.ts` (250 lines, untested)
- Session key generation, ID normalization, identity linking
- Functions: `normalizeAgentId()`, `normalizeAccountId()`,
  `buildAgentPeerSessionKey()`, `resolveLinkedPeerId()`
- **Risk:** Session key collisions could route messages to wrong conversations;
  ID normalization is security-critical
- **Recommended tests:** Invalid characters, 4 dmScope variants, identity
  link resolution, thread ID edge cases

### `src/routing/bindings.ts` (121 lines, untested)
- Agent-to-account-to-channel routing resolution
- Functions: `listBoundAccountIds()`, `buildChannelAccountBindings()`,
  `resolvePreferredAccountId()`
- **Risk:** Incorrect binding resolution = messages go to wrong agent
- **Recommended tests:** Missing bindings, empty arrays, wildcard handling,
  account normalization

---

## Priority 4: Auto-Reply Security and Orchestration

### `src/auto-reply/command-auth.ts` (security-critical, untested)
- Command authorization and sender validation
- Functions: `resolveProviderFromContext()`, allowlist validation
- **Risk:** Authorization bypass if context resolution fails
- **Recommended tests:** Mixed provider hints, missing fields, allowlist
  edge cases

### `src/auto-reply/reply/commands-allowlist.ts` (security-critical, untested)
- User add/remove from allow lists, config file writes
- Functions: Account resolution per channel, config write validation
- **Risk:** Config corruption on write; channel resolution ambiguity
- **Recommended tests:** Per-channel account resolution, concurrent writes,
  malformed input handling

### `src/auto-reply/reply/agent-runner.ts` (critical orchestration, untested)
- Main agent execution: session management, memory flush, usage tracking
- Functions: `runReplyAgent()`, followup queue management
- **Risk:** Session corruption on partial failure; race conditions
- **Recommended tests:** State transitions, timeout handling, memory flush
  failures, concurrent dispatches

### `src/auto-reply/reply/agent-runner-execution.ts` (untested)
- Agent turn execution with model fallback support
- Functions: `runAgentTurnWithFallback()`, embedded Pi vs CLI detection
- **Risk:** Session corruption during fallback; context overflow handling
- **Recommended tests:** Fallback chain, error recovery, compaction failures

### `src/auto-reply/reply/directive-handling.auth.ts` (security, untested)
- Auth profile resolution, API key masking
- Functions: `resolveAuthLabel()`, `maskApiKey()`
- **Risk:** Key masking could leak full keys if string length < 16
- **Recommended tests:** Short keys, empty keys, profile cooldown checks

---

## Priority 5: Gateway Authentication and State

### `src/gateway/device-auth.ts` (32 lines, untested)
- Auth payload construction with v1/v2 format detection
- Functions: `buildDeviceAuthPayload()` (pipe-delimited tokens)
- **Risk:** Field ordering errors break device-side parsing; nonce handling
- **Recommended tests:** v1 vs v2 format, empty fields, field ordering

### `src/gateway/exec-approval-manager.ts` (83 lines, untested)
- Approval workflow state machine for command execution
- Functions: `create()`, `waitForDecision()`, `resolve()`
- **Risk:** Race conditions between timeout expiry and manual resolution
- **Recommended tests:** Concurrent resolves, expired timeouts, cleanup

### `src/gateway/http-utils.ts` (untested)
- Bearer token extraction, agent ID resolution from headers/models
- Functions: `getBearerToken()`, `resolveAgentIdFromHeader()`,
  `resolveAgentIdFromModel()`
- **Risk:** Auth bypass via malformed headers
- **Recommended tests:** Missing/malformed Authorization header, array vs
  string header values, model string parsing

### `src/gateway/node-command-policy.ts` (untested)
- Platform-specific command allowlisting (ios, android, macos, linux, windows)
- **Risk:** Missing commands on a platform = blocked functionality;
  extra commands = security hole
- **Recommended tests:** Platform coverage, unknown platform fallback

---

## Priority 6: Config Session Management

### `src/config/sessions/store.ts` (467 lines, untested)
- In-memory session cache with 45-second TTL, JSON5 persistence
- Functions: Cache TTL logic, file mtime invalidation, session merging
- **Risk:** Cache divergence from disk; stale sessions
- **Recommended tests:** TTL expiration, mtime invalidation, merge conflicts,
  concurrent load handling

### `src/config/sessions/reset.ts` (170 lines, untested)
- Session freshness tracking, daily reset scheduling
- Functions: `resolveDailyResetAtMs()`, `resolveSessionResetType()`
- **Risk:** Timezone/DST edge cases in reset scheduling
- **Recommended tests:** DST transitions, day boundary crossing, idle timeout

---

## Priority 7: Memory Module

### `src/memory/manager-search.ts` (untested)
- Vector search with cosine similarity and SQL filtering
- **Risk:** Incorrect similarity scoring returns wrong memories
- **Recommended tests:** Score thresholds, filter combinations, empty results

### `src/memory/sync-memory-files.ts` (untested)
- File indexing orchestration with concurrency control
- **Risk:** State management during concurrent indexing
- **Recommended tests:** Concurrent sync, progress tracking, partial failure

### `src/memory/manager-cache-key.ts` (untested)
- Cache key computation from 10+ config parameters
- **Risk:** Cache collisions if parameters are missed
- **Recommended tests:** Parameter ordering, deterministic hashing

---

## Existing Test Failures (5 failures in current run)

These are pre-existing issues that should also be addressed:

1. **`src/gateway/server.nodes.late-invoke.test.ts`** - Hook timeout in
   `beforeAll`; server not starting within 120s
2. **`src/cli/program.smoke.test.ts`** - Test timeout (120s) on
   `runs message with required options`
3. **`src/agents/pi-tools.safe-bins.test.ts`** - Test timeout on
   `threads tools.exec.safeBins into exec allowlist checks`
4. **`src/agents/pi-tools.workspace-paths.test.ts`** - Two failures: timeout +
   ENOENT on `process.chdir` to temp directory (cleanup race condition)
5. **`src/gateway/tools-invoke-http.test.ts`** - Test timeout on
   `invokes a tool and returns {ok:true,result}`

---

## Summary: Recommended Test Investment Order

| Priority | Area | Files | Est. Tests | Impact |
|----------|------|-------|------------|--------|
| P1 | Security module | 3 | 40-60 | Prevents permission and ACL bypass |
| P2 | Config core (io, validation, migrations) | 6 | 80-120 | Prevents data loss on upgrade, path traversal |
| P3 | Routing session keys + bindings | 2 | 50-70 | Prevents message misrouting |
| P4 | Auto-reply security + orchestration | 5 | 60-80 | Prevents auth bypass, session corruption |
| P5 | Gateway auth + state | 4 | 30-40 | Prevents auth bypass, race conditions |
| P6 | Config session management | 2 | 30-40 | Prevents stale/corrupt sessions |
| P7 | Memory module | 3 | 20-30 | Prevents incorrect memory retrieval |
| -- | Fix existing failures | 5 | -- | Stabilizes CI |
