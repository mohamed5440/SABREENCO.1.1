import { parseStringArray } from "./utils";

/**
 * Normalizes Arabic text by removing diacritics, normalizing different forms of Alif,
 * Taa Marbouta, Alif Maqsoura, and Hamza for diacritics-insensitive and spelling-insensitive searches.
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return (
    text
      .toLowerCase()
      .trim()
      // Remove diacritics
      .replace(/[\u064B-\u065F]/g, "")
      // Normalize Alifs
      .replace(/[أإآٱ]/g, "ا")
      // Normalize Taa Marbouta to Haa
      .replace(/ة/g, "ه")
      // Normalize Alif Maqsoura to Yaa
      .replace(/ى/g, "ي")
      // Normalize hamzas
      .replace(/[ؤئ]/g, "ء")
  );
}

/**
 * Parses and processes a raw search query string into processed Arabic search terms.
 */
export function getSearchTerms(query: string): string[] {
  if (!query) return [];
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeArabic);
}

/**
 * Normalizes Arabic text AND strips common prefixes (e.g., Al-, Wal-, Bal-, Lil-, etc.)
 * safely to provide extremely precise semantic searches.
 */
export function normalizeAndStemText(text: string): string {
  if (!text) return "";

  // Split into words by whitespace
  const words = text.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const processedWords = words.map((word) => {
    // 1. Strip diacritics and kashida (stretching character)
    const clean = word.replace(/[\u064B-\u065F]/g, "").replace(/\u0640/g, "");

    // 2. Strip prefixes safely (must be longer than 3 letters to avoid corrupting roots)
    const isAlif = (c: string) => c === "ا" || c === "ٱ";
    const isLam = (c: string) => c === "ل";
    const isWaw = (c: string) => c === "و";
    const isBaa = (c: string) => c === "ب";
    const isKaa = (c: string) => c === "ك";
    const isFaa = (c: string) => c === "ف";

    let stripped = clean;
    if (clean.length > 3) {
      if (
        clean.length >= 6 &&
        isWaw(clean[0]) &&
        isAlif(clean[1]) &&
        isLam(clean[2])
      ) {
        stripped = clean.substring(3);
      } else if (
        clean.length >= 6 &&
        (isBaa(clean[0]) || isKaa(clean[0]) || isFaa(clean[0])) &&
        isAlif(clean[1]) &&
        isLam(clean[2])
      ) {
        stripped = clean.substring(3);
      } else if (clean.length >= 5 && isLam(clean[0]) && isLam(clean[1])) {
        stripped = clean.substring(2);
      } else if (clean.length >= 5 && isAlif(clean[0]) && isLam(clean[1])) {
        stripped = clean.substring(2);
      } else if (clean.length >= 4 && isWaw(clean[0])) {
        const rest = clean.substring(1);
        const startsWithAl =
          rest.length >= 2 && isAlif(rest[0]) && isLam(rest[1]);
        if (startsWithAl && rest.length >= 5) {
          stripped = rest.substring(2);
        } else {
          stripped = rest;
        }
      }
    }

    // 3. Normalize Arabic characters
    return (
      stripped
        // Normalize Alifs
        .replace(/[أإآٱ]/g, "ا")
        // Normalize Taa Marbouta to Haa
        .replace(/ة/g, "ه")
        // Normalize Alif Maqsoura to Yaa
        .replace(/ى/g, "ي")
        // Normalize hamzas
        .replace(/[ؤئ]/g, "ء")
    );
  });

  return processedWords.join(" ");
}

/**
 * Universal Arabic search match for Offers (supporting both client view and admin dashboard context).
 */

function matchStemmedTerms(searchContent: string, terms: string[]): boolean {
  const stemmedContent = normalizeAndStemText(searchContent);
  const stemmedQueryTerms = terms.map(t => normalizeAndStemText(t)).filter(Boolean);
  return stemmedQueryTerms.every((term) => stemmedContent.includes(term));
}

export function matchesOffer(
  offer: any,
  terms: string[],
  destinationFilter?: string,
  onlyActive = false,
): boolean {
  if (onlyActive && offer.status !== "نشط") return false;

  // Destination filter checks (mostly for public client page)
  if (destinationFilter) {
    const stemmedDestFilter = normalizeAndStemText(destinationFilter);
    const stemmedOfferDest = normalizeAndStemText(offer.destination || "");
    const stemmedOfferTitle = normalizeAndStemText(offer.title || "");
    const stemmedOfferDesc = normalizeAndStemText(offer.description || "");

    const destMatches =
      stemmedOfferDest.includes(stemmedDestFilter) ||
      stemmedOfferTitle.includes(stemmedDestFilter) ||
      stemmedOfferDesc.includes(stemmedDestFilter);

    if (!destMatches) return false;
  }

  if (terms.length === 0) return true;

  const searchContent = [
    offer.title,
    offer.description,
    offer.destination,
    offer.price,
    offer.currency,
    offer.duration,
    offer.status,
  ]
    .map((val) => (val ? String(val) : ""))
    .join(" ");

  return matchStemmedTerms(searchContent, terms);
}

/**
 * Universal Arabic search match for Visas.
 */
export function matchesVisa(
  visa: any,
  terms: string[],
  onlyActive = false,
): boolean {
  if (onlyActive && visa.status !== "نشط") return false;
  if (terms.length === 0) return true;

  const featuresStr = parseStringArray(visa.features).join(" ");

  const searchContent = [
    visa.title,
    visa.description,
    visa.descriptionTitle,
    visa.price,
    visa.currency,
    visa.status,
    visa.processingTime,
    visa.duration,
    featuresStr,
  ]
    .map((val) => (val ? String(val) : ""))
    .join(" ");

  return matchStemmedTerms(searchContent, terms);
}

/**
 * Universal Arabic search match for Destinations.
 */
export function matchesDestination(dest: any, terms: string[]): boolean {
  const stemmedQueryTerms = terms
    .map((t) => normalizeAndStemText(t))
    .filter(Boolean);
  if (stemmedQueryTerms.length === 0) return true;

  const searchContent = [dest.name, dest.description, dest.category]
    .map((val) => (val ? String(val) : ""))
    .join(" ");

  const stemmedContent = normalizeAndStemText(searchContent);
  return stemmedQueryTerms.every((term) => stemmedContent.includes(term));
}

/**
 * Universal Arabic search match for Bookings.
 */
export function matchesBooking(booking: any, terms: string[]): boolean {
  const stemmedQueryTerms = terms
    .map((t) => normalizeAndStemText(t))
    .filter(Boolean);
  if (stemmedQueryTerms.length === 0) return true;

  // Map serviceType to Arabic for searchability
  let serviceTypeAr = "";
  if (booking.serviceType === "flight") serviceTypeAr = "طيران";
  else if (booking.serviceType === "hotel") serviceTypeAr = "فندق فنادق";
  else if (
    booking.serviceType === "visa" ||
    booking.serviceType?.startsWith("visa")
  )
    serviceTypeAr = "تاشيرة تاشيرات";
  else if (booking.serviceType === "umrah") serviceTypeAr = "عمرة";
  else if (booking.serviceType === "insurance") serviceTypeAr = "تأمين تامين";
  else if (booking.serviceType === "company") serviceTypeAr = "شركات شركة";

  const searchContent = [
    booking.id,
    booking.name,
    booking.user,
    booking.phone,
    booking.email,
    booking.passportNumber,
    booking.service,
    booking.serviceType,
    serviceTypeAr,
    booking.date,
    booking.status,
    booking.amount,
    booking.details,
    booking.preferredContact,
    booking.preferredContactTime,
    booking.passportImage,
    booking.personalPhoto,
    Array.isArray(booking.documents) ? booking.documents.join(" ") : booking.documents,
  ]
    .map((val) => (val ? String(val) : ""))
    .join(" ");

  const stemmedContent = normalizeAndStemText(searchContent);
  return stemmedQueryTerms.every((term) => stemmedContent.includes(term));
}
