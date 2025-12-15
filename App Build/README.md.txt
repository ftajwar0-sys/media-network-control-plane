# Media Network Control Plane

A Node.js backend system that simulates a control plane for a media network with
dynamic node registration, load-based routing, capacity enforcement, and recovery.

## Features
- Node registration with capacity limits
- Least-load routing strategy
- 503 errors when capacity is exhausted
- Recovery by adding new nodes
- Metrics endpoint for observability

## API Endpoints
- GET `/` – Health check
- POST `/nodes` – Register a node
- POST `/route` – Route a request
- GET `/metrics` – View system metrics

## Tech Stack
- Node.js
- Native HTTP module
- REST APIs

## Proof
See screenshots in the `screenshots/` folder demonstrating:
1. Load distribution
2. Capacity exhaustion (503)
3. Recovery after scaling
