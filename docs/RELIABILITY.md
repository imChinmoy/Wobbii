# Wobbii — Reliability & Testing Playbook

## 1. Invariants

1. `0 <= allocated_count <= capacity` for every slot.
2. `allocated_count == count(HELD-not-yet-released + CONFIRMED)` after committed operations (expired holds count until atomically released; confirmation checks expiry regardless).
3. A reservation can be released at most once.
4. Duplicate idempotency keys cannot create duplicate bookings.
5. Clients must not show an uncertain operation as definitely failed or definitely confirmed.

## 2. Failure matrix

| Failure | Expected behavior | Test |
|---|---|---|
| Two users take last unit | One succeeds, one gets full | Parallel integration test |
| 500 requests for 50 units | At most 50 allocations | k6 + DB assertion |
| Same key repeated | Same result, one reservation | Parallel duplicate requests |
| Same key, changed body | 409 conflict | API integration |
| Response lost after commit | Retry returns prior result | Proxy-induced timeout |
| App killed mid-request | Pending operation reconciles | Flutter restart test |
| Confirmation races expiry | One valid outcome | Controlled transaction race |
| Worker processes expiry twice | Capacity released once | Worker retry test |
| PostgreSQL temporarily down | Safe error, no false success | Dependency shutdown |
| Redis unavailable | Core booking correctness preserved | Redis shutdown |
| WebSocket reconnect | Refetch authoritative status | Disconnect/reconnect test |
| API restart | Committed data survives | Restart integration |

## 3. Test layers

- **Unit:** state machine, validation, permissions, error mapping.
- **Integration:** real PostgreSQL, transaction boundaries, unique constraints, locks.
- **Contract:** HTTP status codes, response schemas, idempotency semantics.
- **Flutter:** repository, Riverpod state transitions, persistence/restart behavior.
- **Load:** k6 traffic scenarios and post-run database assertions.
- **Fault injection:** API restart, DB outage, network loss, slow requests.

## 4. Load test protocol

Run against a documented environment (CPU, RAM, PostgreSQL config, API replica count).

Scenarios:
1. Baseline: 10 virtual users browsing slots.
2. Contention: 50 virtual users competing for 10 units.
3. Spike: 500 concurrent attempts for 50 units.
4. Duplicate requests: repeat the same keys.
5. Mixed workload: reads, holds, confirms, cancellations.

Track throughput, p50/p95/p99 latency, request failures by category, pool saturation, CPU, memory, deadlocks, and DB invariant violations.

**Important:** A `409 FULL` is an expected business rejection, not a system failure. Report it separately from 5xx errors and timeouts.

## 5. Observability

Each request logs: timestamp, request ID, route, actor ID (if authorized), duration, outcome code, error category; never log passwords or access tokens.

Metrics:
- `http_requests_total`
- `http_request_duration_seconds`
- `reservation_hold_attempts_total{result}`
- `reservation_invariant_violations_total`
- `db_pool_wait_duration_seconds`
- `worker_jobs_total{result}`
- `websocket_connections`

## 6. Retry policy

- Retry only transient failures.
- Use bounded exponential backoff with jitter.
- Preserve the original idempotency key.
- Avoid infinite client retries.
- Background jobs must be safe under at-least-once execution.
- Distinguish definitive rejections from unknown outcomes.

## 7. Release gate

- [ ] All migrations apply to an empty database.
- [ ] No overselling in contention tests.
- [ ] Duplicate requests are idempotent.
- [ ] Hold expiry and confirmation race tests pass.
- [ ] Flutter restart reconciliation passes.
- [ ] API and worker restart tests pass.
- [ ] No secrets in logs.
- [ ] Performance results and environment recorded.
