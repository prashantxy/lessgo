---
title: localhost6767
tag: Desktop-context AI assistant
year: "2025"
excerpt: The backend for a desktop overlay assistant — it watches the active window and clipboard, decides what is worth remembering, and answers with that context behind it.
stack: [Bun, Express, WebSockets, OpenAI, Supermemory]
---

Most assistants start every conversation knowing nothing about what you were just doing. localhost6767 is the backend for one that does: a desktop overlay that knows which window is in front, what you just copied, and what it has seen you work on before.

## Collecting context

A collector samples the machine — the frontmost application and its window title (read through System Events on macOS) and the clipboard — and turns them into a context record. A short TTL cache drops anything seen within the last fifteen seconds, so copying the same thing twice, or sitting on one window, does not flood the memory with duplicates.

## Deciding what matters

Not everything on screen should be remembered, and some of it must never be. An intent step classifies each context before anything is stored: code, terminal errors and stack traces, technical terms, articles and docs, video and music, shopping. And it screens for secrets first — anything that looks like a password, OTP, token, API key or private key is refused outright.

## Memory, ranked

Useful context goes to a persistent memory layer (Supermemory). When a question comes in, related memories are pulled back and ranked before they reach the model: results below a similarity floor are dropped, near-duplicates are collapsed to the best-scoring copy, and only the top few survive. The answer comes from OpenAI with that context in the prompt, and goes back to the overlay over a WebSocket.

```
active window + clipboard → collector → intent (and secret screen)
    → memory ── question → rank + dedupe → OpenAI → WebSocket → overlay
```

Built at a hackathon, in Bun and Express.
