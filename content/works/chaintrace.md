---
title: ChainTrace
tag: Supply-chain security
year: "2026"
excerpt: Map npm and PyPI into a graph, then answer the incident question — a package just turned malicious; which of my services are hit, how badly, and through what path?
stack: [Bun, TypeScript, HydraDB, OpenCypher, Next.js, three.js]
---

When a package is compromised, the first hour is spent on one question: *which of our services actually pull this version in, and how?* Lockfiles answer it one repository at a time. ChainTrace answers it as a graph query.

## The graph

ChainTrace crawls the npm and PyPI registries — every version of a package, its resolved transitive dependencies, and the people who maintain it — and stores them in HydraDB, an object-store-native graph database that speaks OpenCypher.

```
(:Package)-[:HAS_VERSION]->(:Version)-[:DEPENDS_ON]->(:Version)
(:Service)-[:DEPENDS_ON_VERSION]->(:Version)
(:Maintainer)-[:MAINTAINS]->(:Package)
```

Services are registered with the exact versions they pin, so they hang off the same graph as the registry data. Every vertex ID is a deterministic FNV-1a hash of its key (`version:npm:axios@1.7.2`), which makes re-ingestion idempotent: crawling the same package twice merges into the graph instead of duplicating it.

## The questions it answers

Given any version key — `npm:name@ver` or `pypi:name@ver`:

- **Blast radius** — a BFS over dependency edges to every service reachable from the compromised version, with hop counts.
- **Attack paths** — the shortest path from each affected service down to it: *how* it gets in.
- **Risk** — per-service and per-package scores, with production exposure weighted highest, mapped to CRITICAL / HIGH / MEDIUM / LOW.
- **Co-maintainers** — other packages sharing a maintainer with the target, which is where a stolen account spreads next.
- **Typosquats** — Levenshtein-distance neighbours of a name across every known package.
- **Lockfiles** — given a compromised version and your lockfile entries, exactly which entries resolve to it.

## Three ways in

A Bun + TypeScript REST API does the ingestion and analysis. On top of it: an operator console in Next.js with a 3D dependency graph and risk dashboards, and a `chaintrace` CLI compiled to a single binary — `chaintrace scan --path .` walks a project's lockfile (`bun.lock`, `package-lock.json`, `npm-shrinkwrap.json`) and runs the whole analysis against it, with GitHub device-flow login.

```
Front-end (Next.js) ──HTTP──► Backend API (Bun) ──OpenCypher──► HydraDB
                                    ▲
                          chaintrace CLI ──HTTP┘
```

Built at a HydraDB hackathon; the database itself is Rust, with S3-compatible storage as the source of truth, Neo4j-compatible Bolt, and GraphBLAS traversal kernels.
