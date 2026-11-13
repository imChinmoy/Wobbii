
# Wobbii

**Building a scalable and distributed reservation system from scratch, guided by fundamental software engineering principles.**

Wobbii is a reservation management platform designed with scalability, reliability, and consistency in mind. The goal is to build a system that can handle concurrent requests, prevent booking conflicts, and maintain data integrity as the application grows.

Rather than starting with complex infrastructure, Wobbii follows a fundamentals-first approach: building a reliable foundation, understanding system behavior, and introducing complexity only when it is necessary.

## Engineering Philosophy

The system is being designed around a few core principles:

- **Simplicity First:** Start with simple, understandable solutions before introducing unnecessary abstractions.
- **Scalability:** Design components with future growth and increasing workloads in mind.
- **Reliability:** Ensure predictable behavior, proper error handling, and graceful failure.
- **Data Consistency:** Maintain accurate and consistent data, especially when handling concurrent operations.
- **Separation of Concerns:** Keep business logic, infrastructure, and application layers independent.
- **Security:** Follow secure authentication, authorization, and data management practices.
- **Observability:** Make system behavior understandable through meaningful logs, metrics, and health checks.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Backend Framework | Fastify |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Database Driver | postgres.js |
| Validation | Zod |
| Containerization | Docker & Docker Compose |
| Mobile Application | Flutter |
| Testing | Vitest |

## Architecture

Wobbii follows a modular backend architecture with clear separation between application logic and infrastructure.

```text
Wobbii/
│
├── backend/
│   ├── src/
│   │   ├── application/       # Application and business logic
│   │   ├── infrastructure/    # Database and external services
│   │   ├── routes/             # API routes
│   │   ├── plugins/            # Fastify plugins
│   │   └── app.ts              # Application entry point
│   │
│   ├── drizzle/                # Database migrations
│   ├── test/                   # Automated tests
│   └── package.json
│
├── mobile/                     # Flutter application
│
├── docker-compose.yml
└── README.md
```

*The directory structure represents the intended modular organization and may evolve as the system develops.*

## Database

PostgreSQL is the primary relational database.

The initial data model consists of four core entities:

- **Users:** Stores user information and authentication details.
- **Resources:** Represents bookable resources.
- **Slots:** Represents available reservation time slots.
- **Reservations:** Stores reservation records and their relationships.

Drizzle ORM provides type-safe database queries and schema management, while migrations maintain controlled database evolution.

## System Design Goals

The reservation system is intended to address some of the fundamental challenges involved in building distributed applications.

### 1. Concurrency Control

Multiple users may attempt to reserve the same resource or time slot simultaneously.

The system must prevent conflicting reservations and ensure that a resource cannot be double-booked.

### 2. Data Consistency

Database transactions and appropriate concurrency-control mechanisms will be used to preserve data integrity.

### 3. Scalability

The architecture should support increasing traffic and workloads without requiring a complete redesign.

### 4. Fault Tolerance

The system should handle failures predictably, avoid inconsistent states, and recover gracefully.

### 5. Distributed System Design

As complexity grows, the system will explore concepts such as:

- Horizontal scaling
- Stateless services
- Database connection management
- Caching strategies
- Distributed locking and coordination
- Idempotency
- Message queues and asynchronous processing
- Load balancing

These concepts will be introduced based on actual architectural requirements rather than prematurely adding complexity.

## Development Principles

Wobbii is being built with a learning-oriented engineering mindset.

The focus is not simply on making endpoints work, but on understanding:

- Why a particular architectural decision is made.
- How the database behaves under concurrent operations.
- What happens when multiple requests arrive simultaneously.
- How failures affect the overall system.
- Where bottlenecks emerge as traffic increases.
- How to evolve a monolithic foundation into a scalable architecture when necessary.

## Project Vision

The long-term goal is to build a reliable, scalable, and distributed reservation platform while exploring the engineering principles behind real-world backend systems.

**Build from fundamentals. Understand the trade-offs. Scale with purpose.**
