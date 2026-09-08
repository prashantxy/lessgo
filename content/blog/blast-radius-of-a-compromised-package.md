---
title: "The blast radius of a compromised package"
date: "2026-07-02"
excerpt: "Building ChainTrace meant answering one question fast: if this dependency is bad, what breaks?"
tags: ["security", "supply-chain", "graphs"]
---

When a package gets compromised — a maintainer account phished, a malicious version published, a typosquat installed by mistake — the first question is always the same: *what depends on this?* Not directly. Transitively. All the way down.

That question is a graph traversal, and the npm and PyPI ecosystems are graphs whether we model them or not. ChainTrace makes the graph explicit so the traversal is a query instead of a research project.

## Modelling the ecosystem

Three node types do most of the work: `Package`, `Version`, and `Project` (a real lockfile from a real repo). Edges: `HAS_VERSION`, `DEPENDS_ON` (version to version, resolved), `USES` (project to version).

The hard part isn't storing this. It's resolving it. `^1.2.0` is not an edge — it's a constraint that resolves to a different concrete version depending on what else is in the tree. The ingestion pipeline is a semver-aware resolver that walks a lockfile and writes down the edges that *actually exist* for that project, not the ones the manifest hints at.

## Blast radius

Once the edges are concrete, blast radius is a reverse traversal from a compromised `Version` node:

```
MATCH (bad:Version {package: $pkg, version: $ver})
MATCH (p:Project)-[:USES|DEPENDS_ON*1..]->(bad)
RETURN p, length(path) AS depth
```

Depth matters. A project that depends on the bad version directly can pin around it in minutes. A project that picks it up six levels down through three other maintainers has a much worse week.

## Attack paths

The same graph answers the offensive question. Typosquats show up as packages one edit-distance from a popular name with a suspicious install script. Lockfile tampering shows up as a resolved edge that semver says shouldn't exist. Both are patterns over the graph, and once you have the graph, they're cheap to look for continuously rather than after an incident.
