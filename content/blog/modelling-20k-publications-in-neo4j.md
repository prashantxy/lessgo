---
title: "Modelling 20,000 publications as a graph"
date: "2026-08-18"
excerpt: "What changes when institutional research stops being rows in a table and starts being nodes and edges."
tags: ["neo4j", "graphs", "architecture"]
---

The brief sounded like a search problem: let people find research across the university. The relational schema we started with had `papers`, `authors`, `patents`, `departments`, and a pile of join tables. It answered "show me papers by this author" fine. It fell apart the moment anyone asked a question shaped like "how is this lab connected to that one."

Those questions are traversals, not lookups. In SQL they become recursive CTEs that nobody wants to maintain. In a graph they become one line of Cypher.

## The model

We landed on a small vocabulary of nodes — `Publication`, `Person`, `Patent`, `Unit`, `Topic` — and let the edges carry the meaning: `AUTHORED`, `CITES`, `AFFILIATED_WITH`, `ABOUT`. About 20,000 publications, roughly 60,000 nodes once people and topics were folded in, and a few hundred thousand edges.

The useful realisation: the edges are the product. A citation edge and a co-authorship edge are both "connections between two papers," but they mean completely different things, and the graph lets you keep them distinct without a schema migration every time you find a new kind of relationship.

## What it unlocked

- **Shortest path between two researchers** — a genuine "how do these people know each other" answer, in milliseconds.
- **Topic clusters** — community detection over the co-authorship graph surfaced research groups that didn't match the org chart.
- **Provenance** — patents linked back to the publications they cite, which linked back to funding units.

## What I'd watch for

Graph databases make traversal cheap and aggregation expensive. "Count publications per department per year" is still a job for a projection into Postgres or a materialised view. We ended up running both: Neo4j for the shape of the data, Postgres for the counts. That split felt like a compromise at first and now feels correct.
