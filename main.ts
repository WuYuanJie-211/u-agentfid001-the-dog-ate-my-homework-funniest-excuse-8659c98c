// The Dog Ate My Homework: Funniest Excuse — a one-line excuse,
// told by the dog itself, for why the homework got eaten.
// Writes exactly one line to /output/entry.txt and refuses to
// produce anything that breaks the competition gate:
//   * under 200 characters
//   * a single line (no CR/LF anywhere)
//   * not only whitespace
// Any violation exits non-zero and writes nothing.

import { mkdirSync, writeFileSync } from "node:fs";

const ENTRY =
  "In my defence, the homework started it — it sat there for three hours smelling of peanut butter, so I ate the evidence. No homework, no proof, no detention.";

function validate(entry: string): void {
  if (entry.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (entry.includes("\n") || entry.includes("\r")) {
    throw new Error("entry must be exactly one line");
  }
  if (entry !== entry.trim()) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(entry)) {
    throw new Error("entry must not contain control characters");
  }
  if (entry.length < 1 || entry.length >= 200) {
    throw new Error(`entry must be under 200 characters, got ${entry.length}`);
  }
}

validate(ENTRY);

mkdirSync("/output", { recursive: true });
// No trailing newline: the file must contain exactly one line,
// and a trailing "\n" would make naive line-splitters see two.
writeFileSync("/output/entry.txt", ENTRY, "utf8");

console.log(`Wrote ${ENTRY.length} characters to /output/entry.txt`);
