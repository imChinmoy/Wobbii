# Wobbii — Product Requirements Document

**Version:** 1.0  
**Status:** Planning  
**Product:** Reliability-first resource reservation platform

## 1. Overview

Wobbii lets people reserve limited-capacity resources such as university facilities, event slots, appointments, and shared spaces. Its differentiator is **correctness under concurrent requests and failure**, not a novel ticket marketplace.

**Product promise:** A successful reservation remains valid and recoverable even when requests are duplicated, users disconnect, or infrastructure restarts.

## 2. Problem

Typical reservation implementations can suffer from overbooking, duplicate requests, stale availability, lost responses, expired holds that retain capacity, and failed background processing.

## 3. Users and roles

- **Customer:** Browse resources and slots, hold and confirm a reservation, cancel, see history.
- **Resource administrator:** Create resources, define capacity and time slots, inspect bookings.
- **Platform operator:** Investigate errors, inspect metrics and audit events.

## 4. MVP scope

### P0 — Essential
- Authentication and role authorization.
- Resource and slot management.
- Slot availability.
- Temporary reservation holds.
- Confirm/cancel reservations.
- Transaction-safe capacity enforcement.
- Idempotent mutation requests.
- Reservation status lookup and history.
- Integration and concurrency tests.

### P1 — Reliability enhancements
- Durable hold-expiry worker.
- Waitlist and promotion.
- Real-time availability hints and reconciliation.
- Persistent pending operations in Flutter.
- Structured logging, metrics and load tests.

### Out of scope
Payments, seat maps, multi-tenancy, recommendations, microservices, Kubernetes and multi-region replication.

## 5. Core user journeys

1. Customer signs in, browses resources and selects a slot.
2. Customer requests a hold; backend atomically allocates capacity.
3. Customer confirms before expiration, or the hold expires and capacity is released.
4. Customer can cancel a confirmed reservation.
5. If the network response is lost, the client retries with the **same idempotency key** or retrieves the reservation status.
6. Administrator creates resources and schedules slots.

## 6. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Register, log in and refresh sessions | P0 |
| FR-02 | Admin CRUD for resources and slots | P0 |
| FR-03 | Browse slot capacity and availability | P0 |
| FR-04 | Create a temporary hold | P0 |
| FR-05 | Confirm or cancel a hold | P0 |
| FR-06 | Enforce capacity atomically | P0 |
| FR-07 | Deduplicate repeated mutation requests | P0 |
| FR-08 | Retrieve reservation history/status | P0 |
| FR-09 | Expire holds with a durable worker | P1 |
| FR-10 | Manage waitlists | P1 |
| FR-11 | Publish live availability notifications | P1 |
| FR-12 | Reconcile mobile state after reconnect | P1 |

## 7. Reservation rules

- A slot has a nonnegative integer capacity.
- Each reservation consumes **one unit** of capacity in the MVP.
- **Active holds + confirmed reservations <= slot capacity** at all times.
- Allowed states: `HELD -> CONFIRMED`, `HELD -> EXPIRED`, `HELD -> CANCELLED`, `CONFIRMED -> CANCELLED`.
- Confirmation of an expired hold must fail, even if the expiry worker has not run.
- A repeated request with the same scoped idempotency key and payload returns the recorded outcome; the same key with a different payload is rejected.
- WebSocket events are hints; PostgreSQL/API responses remain authoritative.
- Slot capacity must not be reduced below current allocations.

## 8. Nonfunctional requirements

- **Correctness:** Zero overbooking and zero duplicate allocations in defined concurrency tests.
- **Recovery:** A committed reservation can be recovered after client timeout or restart.
- **Security:** AuthN/AuthZ, hashed passwords, validation, secrets management and rate limits.
- **Observability:** Request IDs, structured logs, error metrics, latency percentiles.
- **Maintainability:** Modular monolith, typed contracts, migrations and automated tests.
- **Performance target (initial, not a guarantee):** p95 booking latency below 500 ms in a documented baseline environment; benchmark and revise.

## 9. Stack

| Layer | Technology |
|---|---|
| Mobile | Flutter, Riverpod, Dio, GoRouter |
| Local persistence | Drift / SQLite |
| API | Node.js, TypeScript, Fastify, Zod |
| Data | PostgreSQL, Drizzle ORM |
| Background jobs | Initially PostgreSQL-backed polling; Redis + BullMQ when justified |
| Real time | WebSockets |
| Testing | Vitest, integration tests with PostgreSQL, k6 |
| Operations | Docker Compose, Pino; Prometheus/Grafana later |

## 10. Acceptance criteria

- 500 simultaneous attempts for 50 available units yield **at most 50 allocations** and no overselling.
- Repeating a booking mutation with its original key does not create a second booking.
- Two competing confirmation/expiration operations produce one valid terminal outcome.
- Restarting the API does not lose committed reservations.
- Flutter recovers an uncertain booking outcome after restart.
- All state-changing endpoints have authorization and integration tests.

## 11. Delivery milestones

See [ROADMAP.md](ROADMAP.md) for the ordered module-by-module plan, [ARCHITECTURE.md](ARCHITECTURE.md) for technical design, [RELIABILITY.md](RELIABILITY.md) for failure testing, and [DECISIONS.md](DECISIONS.md) for design rationale.
