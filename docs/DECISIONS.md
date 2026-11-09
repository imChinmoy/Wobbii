# Wobbii — Architecture Decision Records

Record decisions using: **Context → Decision → Consequences → Revisit when**.

## ADR-001: TypeScript + Fastify over Go

**Status:** Accepted

**Context:** The immediate learning goal is reliability and scalable system design, not a new programming language.

**Decision:** Use TypeScript, Node.js and Fastify.

**Consequences:** Faster delivery and familiarity; concurrency correctness still requires careful database design and bounded asynchronous work.

**Revisit when:** Profiling identifies a workload that materially benefits from a different runtime.

## ADR-002: Modular monolith

**Status:** Accepted

**Decision:** Single API application with explicit feature modules, plus an optional separate worker process.

**Why:** Simpler deployment, debugging and transactional boundaries than microservices.

**Revisit when:** Independent scaling or ownership requirements justify extraction.

## ADR-003: PostgreSQL is the source of truth

**Status:** Accepted

**Decision:** Reservation capacity and lifecycle are committed transactionally in PostgreSQL.

**Why:** Redis locks or in-memory counters alone cannot guarantee durable booking correctness.

**Revisit when:** Never replace correctness guarantees without a documented consistency model.

## ADR-004: Slot-row locking for the MVP

**Status:** Proposed; validate in integration tests

**Decision:** Lock the slot row, inspect capacity, write reservation and counter atomically.

**Trade-off:** Straightforward correctness but high contention can serialize bookings on popular slots.

**Revisit when:** Load tests show unacceptable lock contention.

## ADR-005: Persist idempotency results

**Status:** Accepted

**Decision:** Scope and store mutation keys and outcomes transactionally.

**Why:** Recover from duplicate taps, network retries and lost responses.

**Revisit when:** Define key retention and replay policy.

## ADR-006: Delay Redis and BullMQ

**Status:** Accepted

**Decision:** Begin with PostgreSQL-backed expiry processing; add Redis/BullMQ once queue needs are clear.

**Why:** Avoid operational complexity before validating core invariants.

**Revisit when:** Worker throughput, scheduling or delivery semantics require a dedicated queue.

## ADR-007: Flutter persistent pending operations

**Status:** Accepted

**Decision:** Persist reservation intent and key locally before submitting.

**Why:** App termination or connectivity loss must not turn an uncertain operation into a duplicate.

**Revisit when:** Defining offline queuing policies and UX.

## ADR-008: WebSockets are advisory

**Status:** Accepted

**Decision:** Live events notify clients to refresh; REST/DB remains authoritative.

**Why:** Clients may miss or receive duplicated/out-of-order messages.

**Revisit when:** Multi-instance fan-out and event versioning are implemented.

## ADR template

```markdown
## ADR-NNN: Title
**Status:** Proposed / Accepted / Superseded
**Date:** YYYY-MM-DD
**Context:**
**Decision:**
**Alternatives considered:**
**Consequences:**
**Revisit when:**
```
