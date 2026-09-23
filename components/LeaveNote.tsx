"use client";

import { useState } from "react";
import { profile } from "@/content/site";

export default function LeaveNote() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const clean = note.trim();
  const who = name.trim();
  const mailto =
    `mailto:${profile.email}` +
    `?subject=${encodeURIComponent("A note left in your field notebook")}` +
    `&body=${encodeURIComponent(clean + (who ? `\n\n— ${who}` : ""))}`;

  return (
    <form
      className="leave-note"
      /* Enter in the name field should do what the button says, not nothing */
      onSubmit={(e) => {
        e.preventDefault();
        if (clean) window.location.href = mailto;
      }}
    >
      <span className="ln-title hand">leave a note</span>
      <input
        className="ln-field"
        type="text"
        placeholder="your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        aria-label="your name"
      />
      <textarea
        className="ln-field ln-area"
        placeholder="scribble something on your way out…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={600}
        aria-label="your note"
      />
      <a
        className="ln-send"
        href={clean ? mailto : undefined}
        data-disabled={clean ? undefined : true}
        aria-disabled={clean ? undefined : true}
      >
        seal &amp; send ✉
      </a>
    </form>
  );
}
