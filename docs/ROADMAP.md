# Wobbii — Dependency-Ordered Build Roadmap

**Method:** Build a thin end-to-end slice, then deliberately break and harden it. Do not build every UI screen before testing the backend.

## Milestone 0 — Foundation
- [ ] Initialize monorepo (`apps/api`, `apps/mobile`, `packages/contracts`, `docs`).
- [ ] Configure TypeScript ESM, Fastify, Zod, Pino, Vitest.
- [ ] Start PostgreSQL with Docker Compose.
- [ ] Configure Drizzle migrations and test DB.
- [ ] Create Flutter app with Riverpod, Dio and GoRouter.
- [ ] Connect Flutter to `GET /health`.

**Done when:** API, mobile app and DB run locally; CI can run lint/tests.

## Milestone 1 — Data model and resource discovery
- [ ] Design users, resources, slots and reservations.
- [ ] Write DB constraints and indexes.
- [ ] Add seed data.
- [ ] Implement minimal authentication and authorization.
- [ ] Implement admin resource/slot creation.
- [ ] Implement resource and slot listing.
- [ ] Build Flutter browse and slot-detail screens.

**Done when:** A signed-in user can browse a seeded resource and slot.

## Milestone 2 — Transactional reservation engine
- [ ] Define state machine and capacity invariants.
- [ ] Implement hold creation with row locking.
- [ ] Implement confirm/cancel as conditional transitions.
- [ ] Implement reservation status endpoint.
- [ ] Test last-slot contention using real PostgreSQL.
- [ ] Build Flutter hold/confirm/status flow.

**Done when:** Concurrent attempts cannot overbook.

## Milestone 3 — Idempotency and uncertainty
- [ ] Add scoped idempotency records.
- [ ] Implement same-key replay and changed-body rejection.
- [ ] Test parallel duplicate requests.
- [ ] Persist operation keys locally in Flutter.
- [ ] Reconcile after timeout and app restart.

**Done when:** Duplicate taps and lost responses cannot duplicate reservations.

## Milestone 4 — Expiry and durable workers
- [ ] Define hold TTL and DB-time expiry.
- [ ] Build a PostgreSQL-backed expiry poller.
- [ ] Use conditional transitions and release capacity once.
- [ ] Test worker restarts and repeated execution.
- [ ] Add Redis/BullMQ only if a measured need emerges.

**Done when:** Expired holds release capacity safely after worker interruption.

## Milestone 5 — Waitlist and events
- [ ] Implement waitlist membership and promotion.
- [ ] Add outbox events in the same DB transaction as state changes.
- [ ] Implement event publishing and retry.
- [ ] Add WebSocket notifications.
- [ ] Refetch authoritative state on reconnect.

**Done when:** Waitlisted users are promoted safely and clients reconcile state.

## Milestone 6 — Flutter resilience
- [ ] Use feature repositories and typed errors.
- [ ] Add Drift/SQLite caching.
- [ ] Track pending, uncertain, confirmed and rejected operations.
- [ ] Test airplane mode, background/resume and app termination.
- [ ] Provide clear stale/offline UI.

**Done when:** A lost response does not produce false booking status.

## Milestone 7 — Observability and security
- [ ] Request IDs and structured logs.
- [ ] Metrics for HTTP, DB pool and reservation outcomes.
- [ ] Rate limiting, input validation and auth checks.
- [ ] Security and negative-path tests.

**Done when:** Failures are diagnosable without guessing.

## Milestone 8 — Load, failure testing and deployment
- [ ] Create k6 baseline and contention scenarios.
- [ ] Record p50/p95/p99, throughput and business rejections.
- [ ] Run 500 attempts for 50 units; verify invariants.
- [ ] Restart API, DB and worker during tests.
- [ ] Optimize only measured bottlenecks.
- [ ] Containerize API/worker and configure migrations, secrets, backups.
- [ ] Document test environment and results.

**Done when:** A reproducible reliability report demonstrates the guarantees.

## Suggested first-night scope (6–10 hours)

1. **Hour 1:** Repo, Docker PostgreSQL, Fastify health route.
2. **Hour 2:** Drizzle schema, migrations, seed resources/slots.
3. **Hours 3–4:** Transaction-safe hold API.
4. **Hour 5:** Confirmation/cancellation + tests.
5. **Hour 6:** Idempotency and duplicate-request test.
6. **Hours 7–8:** Flutter browse/hold/status flow.
7. **Hours 9–10 (optional):** k6 contention test and README.

**Avoid tonight:** Redis, BullMQ, payment integrations, multi-tenant roles, full offline sync and advanced dashboards.

## Implementation loop for every module

1. Define invariants and API contract.
2. Implement DB constraints and migrations.
3. Write integration tests for the happy path and race/failure path.
4. Implement backend service and route.
5. Integrate the Flutter feature.
6. Run failure tests and document findings.
7. Commit a working vertical slice.
