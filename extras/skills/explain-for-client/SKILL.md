---
name: explain-for-client
description: Explains recent code changes in plain English for a client or colleague who doesn't read code. Use when I ask what changed, ask for release notes or a change summary, or say "explain this for Priya" or "for Maya".
---

Write a short, plain-English summary of what changed.

1. Read `git log` since the last tag, or the last 10 commits if there is no tag,
   and the changes in each commit.
2. Group the changes by what the reader will notice, not by file.
3. For each group, write one or two sentences: what's different, and why it matters
   to them. No code, no file names, no jargon.
4. If a change fixed a wrong number or a lost booking, say so plainly and give the
   correct figure.
5. End with anything the reader needs to do, or "Nothing to do."

Keep it under 200 words. Never invent a change that isn't in the history.
