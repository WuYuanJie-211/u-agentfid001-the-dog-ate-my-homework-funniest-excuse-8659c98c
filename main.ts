// The Dog Ate My Homework: Funniest Excuse
//
// One-line excuse, told by the dog itself, for why the homework got eaten.
// This script validates the line, writes it to /output/entry.txt, forces
// world-readable permissions on the file, then reads it back and proves
// the write landed exactly. Any failed check exits non-zero and the
// entry never reaches the output file in a bad state.

import {
  chmodSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;
const REQUIRED_MODE = 0o644;

const EXCUSE =
  "In my defence, the homework started it — it sat there for three hours smelling of peanut butter, so I ate the evidence. No homework, no proof, no detention.";

function fail(message: string): never {
  throw new Error(`entry check failed: ${message}`);
}

function checkEntry(text: string): void {
  if (text.length === 0) fail("entry is empty");
  if (text.trim().length === 0) fail("entry is only whitespace");
  if (text !== text.trim()) {
    fail("entry has leading or trailing whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    fail("entry must be exactly one line");
  }
  if (text.length >= MAX_CHARS) {
    fail(`entry is ${text.length} characters, limit is under ${MAX_CHARS}`);
  }
  // Lone surrogates can never encode to valid UTF-8, so reject them.
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(i + 1);
      if (next < 0xdc00 || next > 0xdfff) {
        fail("entry is not valid UTF-8 (unpaired high surrogate)");
      }
      i++;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      fail("entry is not valid UTF-8 (unpaired low surrogate)");
    }
  }
  if (/[\u0000-\u001f\u007f]/.test(text)) {
    fail("entry contains control characters");
  }
}

checkEntry(EXCUSE);

mkdirSync("/output", { recursive: true });
// No trailing newline: the file must contain exactly one line, and a
// trailing "\n" would make naive line-splitters see two.
writeFileSync(OUTPUT_PATH, EXCUSE, "utf8");

// The grader may run under a restrictive umask (e.g. 077), so force the
// output world-readable regardless of the process umask.
chmodSync(OUTPUT_PATH, REQUIRED_MODE);

// Read the file back and prove what is on disk is exactly the entry.
const written = readFileSync(OUTPUT_PATH, "utf8");
if (written !== EXCUSE) {
  fail("read-back content does not match the entry");
}
// Byte-level proof as well: a multi-byte character (the em dash) must
// have survived the write intact, so the file's byte length must equal
// the UTF-8 encoded length of the entry, not just its character count.
const writtenBytes = readFileSync(OUTPUT_PATH);
if (writtenBytes.length !== Buffer.byteLength(EXCUSE, "utf8")) {
  fail(
    `read-back is ${writtenBytes.length} bytes, expected ${Buffer.byteLength(EXCUSE, "utf8")}`,
  );
}
const mode = statSync(OUTPUT_PATH).mode & 0o777;
if (mode !== REQUIRED_MODE) {
  fail(`output mode is ${mode.toString(8)}, expected 644`);
}

console.log(
  `Wrote ${EXCUSE.length} characters to ${OUTPUT_PATH} (mode 644, verified)`,
);
