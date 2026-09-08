---
title: "One TUI, four model providers"
date: "2026-06-10"
excerpt: "Terrek talks to OpenAI, Gemini, Claude and Ollama through one interface. The abstraction layer is the whole design."
tags: ["rust", "cli", "ai"]
---

Terrek is a terminal workflow engine. You describe a task, it runs the steps, and some of those steps call a language model. The requirement that shaped everything: it shouldn't care *which* model.

## The seam

Every provider gets reduced to one trait:

```rust
#[async_trait]
trait Provider {
    async fn complete(&self, req: Request) -> Result<Response>;
    fn name(&self) -> &str;
}
```

`Request` and `Response` are Terrek's own types, not any vendor's. Each provider implementation is the adapter between that shared shape and its API — the OpenAI one speaks chat completions, the Ollama one speaks to a local socket, and the rest of Terrek never knows the difference.

This sounds obvious. It's worth doing deliberately because the pressure to leak vendor-specific fields into the shared type is constant, and every leak makes the next provider harder to add.

## BYOK, quietly

No accounts, no proxy. Terrek reads keys from the environment and the OS keychain, detects which providers are actually configured at startup, and only offers those. If you have an `ANTHROPIC_API_KEY` and Ollama running locally, those are your two options and the menu doesn't mention the others.

Bring-your-own-key isn't a feature so much as the absence of one — there's no billing relationship to build, so there's nothing to build.

## What the TUI is for

A CLI flag per option doesn't scale past about six options. The TUI is how a workflow with a dozen knobs stays legible: you see the whole pipeline, the current step, and what each step is about to do before it does it. Ratatui does the drawing; the interesting code is the state machine underneath deciding what's editable when.
