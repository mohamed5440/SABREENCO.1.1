import React from "react";
import { normalizeAndStemText } from "../../lib/searchUtils";

/**
 * A robust Arabic text highlighter component.
 * It uses the same normalization and stemming logic to match terms correctly,
 * even with Arabic diacritics, varying alefs, and prefixes.
 * This is diacritics-insensitive, shape-insensitive, and prefix-tolerant for Arabic letters.
 */
export function HighlightText({
  text,
  search,
}: {
  text: any;
  search: string;
}) {
  if (text === null || text === undefined) return <span>---</span>;
  const textStr = String(text);
  if (!textStr) return <span>---</span>;
  if (!search || !search.trim()) return <span>{textStr}</span>;

  // Split query into terms
  const terms = search.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return <span>{textStr}</span>;

  let parts: string[] = [];
  let isRegExpSuccess = false;

  try {
    // Sort terms by length descending to avoid short terms eating larger terms
    const sortedTerms = [...terms].sort((a, b) => b.length - a.length);

    // Create regex that matches any of the terms (case-insensitive)
    const regexTerms = sortedTerms
      .map((term) => {
        const stem = normalizeAndStemText(term);
        if (!stem) return "";

        const chars = Array.from(stem);
        const patternParts = chars.map((char) => {
          let p = char.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
          if (/[أإآٱا]/.test(p)) {
            p = "[أإآٱا]";
          } else if (/[ةه]/.test(p)) {
            p = "[ةه]";
          } else if (/[ىي]/.test(p)) {
            p = "[ىي]";
          } else if (/[ؤئء]/.test(p)) {
            p = "[ؤئء]";
          }
          return p + "[\\u064B-\\u065F\\u0640]*";
        });

        // If the original term was stripped, or is longer than 3 letters, allow optional Arabic prefixes
        const rawClean = term
          .replace(/[\u064B-\u065F]/g, "")
          .replace(/\u0640/g, "");
        const allowPrefix = rawClean.length > 3;
        const prefixPattern = allowPrefix ? "(?:[وبكفل]?(?:ال|لل|ٱل)?)?" : "";

        return prefixPattern + patternParts.join("");
      })
      .filter(Boolean);

    if (regexTerms.length > 0) {
      const regex = new RegExp(`(${regexTerms.join("|")})`, "gi");
      parts = textStr.split(regex);
      isRegExpSuccess = true;
    }
  } catch {
    isRegExpSuccess = false;
  }

  if (!isRegExpSuccess || parts.length === 0) {
    return <span>{textStr}</span>;
  }

  return (
    <span>
      {parts.map((part, i) => {
        return i % 2 !== 0 ? (
          <mark
            key={i}
            className="bg-primary-soft text-primary-dark font-medium px-0.5 rounded border-b border-primary/30"
          >
            {part}
          </mark>
        ) : (
          part
        );
      })}
    </span>
  );
}
