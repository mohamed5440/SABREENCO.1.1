import React from "react";
import { normalizeArabic, stemArabicWord, SYNONYM_MAP } from "../../lib/searchUtils";

function buildArabicCharPattern(word: string): string {
  if (!word || word.length < 2) return "";
  const chars = Array.from(word);
  const patternParts = chars.map((char) => {
    let p = char.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    if (/[أإآٱا]/.test(p)) {
      p = "[أإآٱا]";
    } else if (/[ةه]/.test(p)) {
      p = "[ةه]";
    } else if (/[ىيئ]/.test(p)) {
      p = "[ىيئ]";
    } else if (/[ؤو]/.test(p)) {
      p = "[ؤو]";
    }
    return p + "[\\u064B-\\u065F\\u0640]*";
  });

  const allowPrefix = /[\u0600-\u06FF]/.test(word) && word.length >= 2;
  const prefixPattern = allowPrefix ? "(?:[وبكفل]?(?:ال|لل|ٱل)?)?" : "";
  return prefixPattern + patternParts.join("");
}

/**
 * A robust Arabic & multilingual text highlighter component.
 * Uses Arabic normalization, stemming, dual Western/Eastern numeral support,
 * and domain synonyms to highlight matching words and roots smoothly.
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
  const terms = search.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return <span>{textStr}</span>;

  let parts: string[] = [];
  let isRegExpSuccess = false;

  try {
    const rawPatterns: string[] = [];

    for (const term of terms) {
      const cleanTerm = term.trim();
      if (!cleanTerm) continue;

      // Convert Eastern/Persian numerals to Western for digit check
      const westernTerm = cleanTerm
        .replace(/[٠۰]/g, "0")
        .replace(/[١۱]/g, "1")
        .replace(/[٢۲]/g, "2")
        .replace(/[٣۳]/g, "3")
        .replace(/[٤۴]/g, "4")
        .replace(/[٥۵]/g, "5")
        .replace(/[٦۶]/g, "6")
        .replace(/[٧۷]/g, "7")
        .replace(/[٨۸]/g, "8")
        .replace(/[٩۹]/g, "9");

      // If numeric / phone query
      if (/^\+?\d+$/.test(westernTerm)) {
        const digitsOnly = westernTerm.replace(/[^\d]/g, "");
        if (digitsOnly.length > 0) {
          const digitPattern = Array.from(digitsOnly)
            .map((d) => {
              const arabicDigit = String.fromCharCode(0x0660 + Number(d));
              const persianDigit = String.fromCharCode(0x06F0 + Number(d));
              return `[${d}${arabicDigit}${persianDigit}]`;
            })
            .join("");
          rawPatterns.push(`\\+?${digitPattern}`);
          continue;
        }
      }

      // Skip 1-character search terms for word highlighting to avoid over-highlighting every letter
      if (cleanTerm.length < 2) continue;

      // Stem term if Arabic
      const norm = normalizeArabic(cleanTerm);
      const stem = stemArabicWord(norm);
      const baseWord = stem && stem.length >= 3 ? stem : norm || cleanTerm;

      if (baseWord && baseWord.length >= 2) {
        const pat = buildArabicCharPattern(baseWord);
        if (pat) rawPatterns.push(pat);
      }

      // Also highlight synonyms (e.g. if searching فيزا, highlight تاشيرة; if searching عروض, highlight عرض)
      const synonyms = SYNONYM_MAP.get(norm) || (stem ? SYNONYM_MAP.get(stem) : undefined);
      if (synonyms) {
        for (const syn of synonyms.slice(0, 4)) {
          if (syn && syn !== norm && syn.length >= 3) {
            const synPat = buildArabicCharPattern(syn);
            if (synPat) rawPatterns.push(synPat);
          }
        }
      }
    }

    const uniquePatterns = Array.from(new Set(rawPatterns.filter(Boolean)));
    // Sort patterns by length descending so longer words match first
    uniquePatterns.sort((a, b) => b.length - a.length);

    if (uniquePatterns.length > 0) {
      const regex = new RegExp(`(${uniquePatterns.join("|")})`, "gi");
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
            className="bg-primary-soft text-primary-dark font-semibold px-0.5 rounded border-b border-primary/30"
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
