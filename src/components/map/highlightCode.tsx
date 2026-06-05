import type { ReactNode } from "react";
import { palette } from "@/lib/palette";

// Lightweight, self-contained syntax highlighter for the short Python-flavored
// pseudo-code shown in element panels' Advanced > Code section. Deliberately NOT a
// full parser — a regex tokenizer is enough for the controlled snippets we author.
// Reused by every element's code block via InfoPanel.
const S = palette.syntax;

// Colored per the keyword token type (purple/magenta). Comprehensive enough for any
// future snippet, not just the orchestrator's `for`/`in`.
const KEYWORDS = new Set([
  "def", "return", "for", "in", "if", "elif", "else", "while", "import",
  "from", "as", "with", "try", "except", "finally", "raise", "class",
  "and", "or", "not", "is", "None", "True", "False", "lambda", "pass",
  "break", "continue", "yield", "global", "nonlocal", "assert", "del",
  "async", "await",
]);

// Matches a string, a number, or an identifier. Text BETWEEN matches (whitespace,
// operators, punctuation) is emitted verbatim as default-colored, so indentation and
// alignment are preserved exactly.
const TOKEN_RE = /("[^"]*"|'[^']*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g;

// Tokenize the part of a line that precedes any comment.
function tokenizeCode(code: string, li: number): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  const push = (text: string, color: string) => {
    if (text.length === 0) return;
    out.push(
      <span key={`${li}-${i++}`} style={{ color }}>
        {text}
      </span>,
    );
  };

  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(code)) !== null) {
    if (m.index > last) push(code.slice(last, m.index), S.default); // gap
    if (m[1]) {
      push(m[1], S.string);
    } else if (m[2]) {
      push(m[2], S.number);
    } else {
      const word = m[3]!;
      if (KEYWORDS.has(word)) push(word, S.keyword);
      // function/method call: identifier immediately before an opening paren
      else if (code[TOKEN_RE.lastIndex] === "(") push(word, S.func);
      else push(word, S.default);
    }
    last = TOKEN_RE.lastIndex;
  }
  if (last < code.length) push(code.slice(last), S.default); // trailing gap
  return out;
}

// Comment takes priority: the first `#` starts a comment that runs to end of line, so
// keyword/quote-looking words inside a comment are never mis-colored.
function highlightLine(line: string, li: number): ReactNode[] {
  const hashIdx = line.indexOf("#");
  const codePart = hashIdx === -1 ? line : line.slice(0, hashIdx);
  const commentPart = hashIdx === -1 ? "" : line.slice(hashIdx);

  const spans = tokenizeCode(codePart, li);
  if (commentPart) {
    spans.push(
      <span key={`${li}-c`} style={{ color: S.comment }}>
        {commentPart}
      </span>,
    );
  }
  return spans;
}

// Returns colored spans for the whole snippet. Render inside <pre><code> so the "\n"
// separators and all whitespace are preserved.
export function highlightCode(code: string): ReactNode {
  const lines = code.split("\n");
  const nodes: ReactNode[] = [];
  lines.forEach((line, li) => {
    if (li > 0) nodes.push("\n");
    nodes.push(...highlightLine(line, li));
  });
  return nodes;
}
