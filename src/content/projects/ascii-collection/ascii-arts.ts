// Арты ASCII Collection: все арты в одном .txt рядом с кодом (импортируется как строка, ?raw).
// Один арт начинается со строки-разделителя вида "-----------8<----------- подпись".
import artsText from "./ascii-arts.txt?raw";
import { textLength } from "./core";

export type AsciiArt = {
  caption: string;
  lines: string[];
  width: number;
  height: number;
};

type RawArt = {
  caption: string;
  lines: string[];
};

// Всё после маркера в строке-разделителе — название арта (напр. "skull48 - VAPZ (2026)").
const SEPARATOR = /^\s*-+8<-+\s*(.*)$/;

export function parseArts(text: string): AsciiArt[] {
  const blocks: RawArt[] = [];
  let current: RawArt | null = null;

  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    const match = line.match(SEPARATOR);
    if (match !== null) {
      if (current !== null) {
        blocks.push(current);
      }
      current = { caption: (match[1] ?? "").trim(), lines: [] };
    } else if (current !== null) {
      current.lines.push(line);
    }
  }
  if (current !== null) {
    blocks.push(current);
  }

  return blocks
    .map((block) => {
      const lines = trimEmptyEdges(block.lines.map(expandTabs));
      return {
        caption: block.caption,
        lines,
        width: Math.max(0, ...lines.map(textLength)),
        height: lines.length
      };
    })
    .filter((art) => art.height > 0);
}

export const ASCII_ARTS: AsciiArt[] = parseArts(artsText);

function trimEmptyEdges(lines: string[]): string[] {
  let start = 0;
  let end = lines.length;
  while (start < end && isBlank(lines[start])) {
    start += 1;
  }
  while (end > start && isBlank(lines[end - 1])) {
    end -= 1;
  }
  return lines.slice(start, end);
}

function isBlank(line: string | undefined): boolean {
  return line === undefined || line.trim() === "";
}

function expandTabs(line: string): string {
  let out = "";
  for (const char of line) {
    out += char === "\t" ? " ".repeat(8 - (out.length % 8)) : char;
  }
  return out;
}
