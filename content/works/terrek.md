---
title: Terrek
tag: Rust CLI / TUI
year: "2026"
excerpt: A terminal-native workflow engine — a real shell in a PTY, a persistent memory of the session, and one AI abstraction over OpenAI, Gemini, Claude and Ollama.
stack: [Rust, tui-rs, crossterm, portable-pty, SQLite]
---

Terrek puts a programmable layer inside the terminal rather than beside it: a real shell running in a pseudo-terminal, a record of what happened in it, and AI you can ask about that record without leaving the prompt. Press `Ctrl+T` and the same window becomes Terrek mode; `Esc` or `terrek exit` hands it back to the shell.

## The shape of it

The core is a PTY. Keystrokes arrive as raw events through crossterm and are written to the PTY master; `bash` runs on the other side of it, and its output comes back the same way.

```
Keyboard ──► crossterm (raw events) ──► PTY master ──► bash
Screen   ◄── PTY master ◄──────────── shell output
```

The first version printed PTY output straight to the screen, which worked until anything else had to share the screen — panes, a status line, Terrek's own prompt. The fix was to stop treating the terminal as a stream and start treating it as a surface:

```
PTY output → screen_buffer → render() → terminal
```

Everything draws into a buffer, and one render pass puts the buffer on screen. That is what made the multi-pane interface possible.

## Remembering the session

Terrek records what goes through the terminal into SQLite. The recorder never writes on the thread that owns the PTY: the PTY thread and the main thread both send into a channel, and a single DB thread drains it.

```
PTY Thread  ─┐
              ├──>  channel  ───>  DB Thread  ──> SQLite
Main Thread ──┘
```

One writer means no lock contention between the thread that has to keep the terminal responsive and the one doing disk I/O, and it rules out the deadlock that shared access to one store invited.

## Bring your own model

`terrek setup` takes an API key, works out which provider it belongs to — OpenAI, Gemini, Claude or Ollama — and stores it locally. Behind that sits one provider abstraction, so a command like `terrek ai "how's my project structure?"` does not care which model answers it. Keys never leave the machine.

The source is split along the same lines as the design: `ai/` for providers and the abstraction over them, `commands/`, `ui/`, `config/`, and `app/` for the engine that ties them together.

## Next

Streaming responses, a plugin system, a real workflow engine for `terrek run`, and tmux-style multiple sessions are on the roadmap.
