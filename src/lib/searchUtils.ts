import { parseStringArray } from "./utils";

// High-performance memoization caches for search normalization & stemming
const arabicNormalizeCache = new Map<string, string>();
const stemTextCache = new Map<string, string>();
const stemWordCache = new Map<string, string>();
const MAX_CACHE_SIZE = 3000;

// High frequency Arabic particles & stop words that must never trigger fuzzy or partial stem matching
const ARABIC_STOP_WORDS = new Set([
  "الي",
  "من",
  "في",
  "عن",
  "علي",
  "مع",
  "كل",
  "هو",
  "هي",
  "ان",
  "انها",
  "كان",
  "كانت",
  "هذا",
  "هذه",
  "ذلك",
  "تلك",
  "لا",
  "ما",
  "لم",
  "لن",
  "لو",
  "او",
  "ثم",
  "بل",
  "قد",
]);

// Travel domain semantic equivalence groups (broken plurals, morphological variants, and geographic equivalents)
export const SYNONYM_GROUPS: string[][] = [
  // Visas: "فيزا" and "تأشيرة" / "تاشيرة" / "فيز"
  ["فيزا", "تاشيره", "تاشيرات", "فيز", "visa", "visas"],
  // Offers & Packages: عرض / عروض / باقة / باقات / بكج / بكجات
  ["عرض", "عروض", "باقه", "باقات", "بكج", "بكجات", "package", "packages", "offer", "offers"],
  // Bookings & Reservations: حجز / حجوزات
  ["حجز", "حجوزات", "booking", "bookings", "reservation", "reservations"],
  // Trips & Tours: رحلة / رحلات / جولة / جولات / سفر
  ["رحله", "رحلات", "جوله", "جولات", "سفر", "tour", "tours", "trip", "trips"],
  // Hotels & Accommodation: فندق / فنادق / اقامة / سكن
  ["فندق", "فنادق", "اقامه", "سكن", "hotel", "hotels"],
  // Flights & Tickets: طيران / تذكرة / تذاكر / طائرة / طيارة
  ["طيران", "تذكره", "تذاكر", "طايره", "طياره", "طائره", "طيارة", "flight", "flights", "airline", "ticket", "tickets"],
  // Umrah pilgrimage: عمرة / عمرات / معتمر
  ["عمره", "عمرات", "معتمر", "umrah"],
  // Geographic spelling & country variants
  ["تركيا", "اسطنبول", "إسطنبول", "turkey", "istanbul"],
  ["دبي", "الامارات", "الإمارات", "امارات", "uae", "dubai"],
  ["شنجن", "شنغن", "schengen"],
  ["عمان", "عُمان", "مسقط", "oman"],
  ["شرم الشيخ", "شرم"],
  ["الغردقه", "الغردقة", "hurghada"],
  ["الصين", "صين", "china"],
  ["السعودية", "سعوديه", "المملكة", "saudi", "ksa"],
  ["مصر", "القاهرة", "قاهره", "egypt", "cairo"],
  ["الاسكندرية", "اسكندريه", "alexandria"],
  ["الساحل", "الساحل الشمالي", "مارينا", "العلمين"],
  ["السخنة", "العين السخنة", "سخنه"],
  ["مرسى علم", "مرسي علم"],
  ["مرسى مطروح", "مرسي مطروح", "مطروح"],
];

// Pre-compiled fast lookup table for synonyms
export const SYNONYM_MAP = new Map<string, string[]>();
SYNONYM_GROUPS.forEach((group) => {
  group.forEach((word) => {
    const existing = SYNONYM_MAP.get(word) || [];
    SYNONYM_MAP.set(word, Array.from(new Set([...existing, ...group])));
  });
});

/**
 * Normalizes text for search:
 * 1. Converts Eastern Arabic & Persian numerals (٠-٩, ۰-۹) to standard Western numerals (0-9).
 * 2. Removes diacritics / tashkeel & dagger alifs.
 * 3. Removes kashida / tatweel (ـ).
 * 4. Normalizes all Alif variations (أ, إ, آ, ٱ, ا) to plain ا.
 * 5. Normalizes Taa Marbouta (ة) to Haa (ه).
 * 6. Normalizes Alif Maqsoura (ى) and Hamza on Nabrah/Yaa (ئ) to Yaa (ي).
 * 7. Normalizes Waw with Hamza (ؤ) to Waw (و).
 * 8. Normalizes isolated Hamza (ء).
 * 9. Replaces punctuation and special symbols with spaces for clean tokenization.
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  const str = String(text);
  const cached = arabicNormalizeCache.get(str);
  if (cached !== undefined) return cached;

  const result = str
    .toLowerCase()
    .trim()
    // 1. Convert Eastern Arabic & Persian digits to standard Western digits
    .replace(/[٠۰]/g, "0")
    .replace(/[١۱]/g, "1")
    .replace(/[٢۲]/g, "2")
    .replace(/[٣۳]/g, "3")
    .replace(/[٤۴]/g, "4")
    .replace(/[٥۵]/g, "5")
    .replace(/[٦۶]/g, "6")
    .replace(/[٧۷]/g, "7")
    .replace(/[٨۸]/g, "8")
    .replace(/[٩۹]/g, "9")
    // 2. Remove diacritics / tashkeel & dagger alifs
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // 3. Remove kashida / tatweel (ـ)
    .replace(/\u0640/g, "")
    // 4. Normalize all Alifs (أ, إ, آ, ٱ, ا) to plain ا
    .replace(/[أإآٱا]/g, "ا")
    // 5. Normalize Taa Marbouta to Haa
    .replace(/ة/g, "ه")
    // 6. Normalize Alif Maqsoura and Hamza on Nabrah/Yaa to Yaa
    .replace(/[ىيئ]/g, "ي")
    // 7. Normalize Waw with Hamza to Waw
    .replace(/ؤ/g, "و")
    // 8. Normalize isolated Hamza
    .replace(/ء/g, "")
    // 9. Replace punctuation, brackets, quotes, slashes, and symbols with whitespace
    .replace(/[،,.\-_/\\()[\]{}:;!?"'`~+*#%&@<>=|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (arabicNormalizeCache.size >= MAX_CACHE_SIZE) {
    arabicNormalizeCache.clear();
  }
  arabicNormalizeCache.set(str, result);
  return result;
}

/**
 * Strips common Arabic grammatical prefixes (ال, لل, وال, بال, كال, فال, ولل, بلل, etc.)
 * and inflectional suffixes (ات, ين, ون, ان, يه, ي, ه)
 * while safely preserving core semantic words.
 */
export function stemArabicWord(word: string): string {
  if (!word || word.length <= 3) return word;

  const cached = stemWordCache.get(word);
  if (cached !== undefined) return cached;

  let w = word;

  // 1. Strip prefixes
  if (
    w.length >= 5 &&
    (w.startsWith("وال") ||
      w.startsWith("بال") ||
      w.startsWith("كال") ||
      w.startsWith("فال") ||
      w.startsWith("ولل") ||
      w.startsWith("بلل"))
  ) {
    w = w.slice(3);
  } else if (
    w.length >= 4 &&
    (w.startsWith("ال") ||
      w.startsWith("لل") ||
      w.startsWith("ول") ||
      w.startsWith("بل") ||
      w.startsWith("فل") ||
      w.startsWith("كل"))
  ) {
    w = w.slice(2);
  }

  if (w.length <= 3) {
    if (stemWordCache.size >= MAX_CACHE_SIZE) stemWordCache.clear();
    stemWordCache.set(word, w);
    return w;
  }

  // Protect "عمره" from collapsing into the person name "عمر"
  if (w === "عمره" || w === "عمرات") {
    if (stemWordCache.size >= MAX_CACHE_SIZE) stemWordCache.clear();
    stemWordCache.set(word, "عمره");
    return "عمره";
  }

  // 2. Strip inflectional suffixes
  if (
    w.length >= 5 &&
    (w.endsWith("ات") ||
      w.endsWith("ين") ||
      w.endsWith("ون") ||
      w.endsWith("ان"))
  ) {
    w = w.slice(0, -2);
  } else if (w.length >= 5 && (w.endsWith("يه") || w.endsWith("ية"))) {
    w = w.slice(0, -2);
  } else if (w.length >= 4 && (w.endsWith("ه") || w.endsWith("ة") || w.endsWith("ي"))) {
    w = w.slice(0, -1);
  }

  if (stemWordCache.size >= MAX_CACHE_SIZE) stemWordCache.clear();
  stemWordCache.set(word, w);
  return w;
}

// Backward compatibility alias
export const stripArabicPrefixes = stemArabicWord;

/**
 * Safely compares two word stems without letting short words or particles cross-match.
 */
function isStemMatch(wordStem: string, termStem: string): boolean {
  if (!wordStem || !termStem) return false;
  if (ARABIC_STOP_WORDS.has(wordStem) || ARABIC_STOP_WORDS.has(termStem)) return false;

  // Exact stem match (e.g. رحلات -> رحل === رحلة -> رحل)
  return wordStem === termStem;
}

/**
 * Normalizes Arabic text AND applies stemming word-by-word.
 */
export function normalizeAndStemText(text: string): string {
  if (!text) return "";
  const cached = stemTextCache.get(text);
  if (cached !== undefined) return cached;

  const words = normalizeArabic(text).split(/\s+/).filter(Boolean);
  const stemmedWords = words.map(stemArabicWord);
  const result = stemmedWords.join(" ");

  if (stemTextCache.size >= MAX_CACHE_SIZE) {
    stemTextCache.clear();
  }
  stemTextCache.set(text, result);
  return result;
}

/**
 * Extracts normalized query terms from a raw search string.
 */
export function getSearchTerms(query: string): string[] {
  if (!query) return [];
  return normalizeArabic(query)
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Extracts core phone digits (strips international codes +20, 0020, 20, or leading 0)
 * to ensure that local and international representations match each other.
 */
function getCorePhoneDigits(digits: string): string {
  if (!digits) return "";
  let d = digits;
  if (d.startsWith("0020")) d = d.slice(4);
  else if (d.startsWith("20")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  return d;
}

/**
 * Matches a single search term against content using:
 * 1. Direct normalized substring match.
 * 2. Morphological stem matching across words.
 * 3. Domain synonyms (فيزا <-> تاشيرة, عرض <-> عروض, etc.).
 * 4. Digit and phone matching (local vs international Egyptian formats).
 */
export function matchSingleTerm(
  normalizedContent: string,
  contentWords: string[],
  stemmedContentWords: string[],
  contentDigits: string,
  coreContentDigits: string,
  term: string,
): boolean {
  if (!term) return true;
  const normTerm = normalizeArabic(term);
  if (!normTerm) return true;

  // 1. Direct normalized substring match
  if (normalizedContent.includes(normTerm)) {
    return true;
  }

  // 2. Stem-based match against words in the content
  const termStem = stemArabicWord(normTerm);
  if (termStem && !ARABIC_STOP_WORDS.has(termStem)) {
    if (stemmedContentWords.some((w) => isStemMatch(w, termStem))) {
      return true;
    }
  }

  // 3. Domain synonyms
  const synonyms = SYNONYM_MAP.get(normTerm) || (termStem ? SYNONYM_MAP.get(termStem) : undefined);
  if (synonyms) {
    for (const syn of synonyms) {
      if (normalizedContent.includes(syn)) return true;
      const synStem = stemArabicWord(syn);
      if (
        synStem &&
        !ARABIC_STOP_WORDS.has(synStem) &&
        stemmedContentWords.some((w) => isStemMatch(w, synStem))
      ) {
        return true;
      }
    }
  }

  // 4. Numeric & phone digit matching
  const termDigits = normTerm.replace(/[^\d]/g, "");
  if (termDigits.length >= 2) {
    if (contentDigits.length >= 2 && contentDigits.includes(termDigits)) return true;
    const coreTerm = getCorePhoneDigits(termDigits);
    if (
      coreTerm.length >= 3 &&
      coreContentDigits.length >= 3 &&
      coreContentDigits.includes(coreTerm)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if search content matches all search terms (AND logic across multiple words).
 */
export function matchStemmedTerms(
  searchContent: string,
  terms: string[],
): boolean {
  if (!terms || terms.length === 0) return true;

  const normalizedContent = normalizeArabic(searchContent);
  const contentWords = normalizedContent.split(/\s+/).filter(Boolean);
  const stemmedContentWords = contentWords.map(stemArabicWord);
  const contentDigits = normalizedContent.replace(/[^\d]/g, "");
  const coreContentDigits = getCorePhoneDigits(contentDigits);

  return terms.every((term) =>
    matchSingleTerm(
      normalizedContent,
      contentWords,
      stemmedContentWords,
      contentDigits,
      coreContentDigits,
      term,
    ),
  );
}

/**
 * Strips repeated company contact phone numbers from offer descriptions
 * so they don't produce false positive search matches when searching for client phone numbers.
 */
function sanitizeOfferTextForSearch(desc: string): string {
  if (!desc) return "";
  return desc
    .replace(/01505084722|01553004593|01103103362/g, "")
    .replace(/sabreenco\.com/gi, "");
}

/**
 * Universal search match for Offers.
 * Handles titles, descriptions, features, destinations, categories, durations, and prices.
 * Supports destination filter when browsing destinations, while allowing free search.
 */
export function matchesOffer(
  offer: any,
  terms: string[],
  destinationFilter?: string,
  onlyActive = false,
): boolean {
  if (!offer) return false;
  if (onlyActive && offer.status !== "نشط") return false;

  // 1. Destination filter checks: always enforce destination filter if specified
  if (destinationFilter && destinationFilter.trim() !== "") {
    const normFilter = normalizeArabic(destinationFilter);
    const stemFilter = stemArabicWord(normFilter);

    const offerDest = normalizeArabic(offer.destination || "");
    const offerTitle = normalizeArabic(offer.title || "");
    const offerDesc = normalizeArabic(offer.description || "");

    const destMatches =
      offerDest.includes(normFilter) ||
      (stemFilter && offerDest.includes(stemFilter)) ||
      offerTitle.includes(normFilter) ||
      (stemFilter && offerTitle.includes(stemFilter)) ||
      offerDesc.includes(normFilter) ||
      (stemFilter && offerDesc.includes(stemFilter));

    if (!destMatches) return false;
  }

  if (terms.length === 0) return true;

  const featuresStr = parseStringArray(offer.features).join(" ");
  const notIncludedStr = parseStringArray(offer.notIncluded).join(" ");
  const sanitizedDesc = sanitizeOfferTextForSearch(offer.description || "");

  const searchContent = [
    offer.title,
    sanitizedDesc,
    offer.descriptionTitle,
    offer.destination,
    offer.category,
    offer.price,
    offer.oldPrice,
    offer.currency,
    offer.duration,
    offer.status,
    offer.badgeText,
    offer.urgencyText,
    featuresStr,
    notIncludedStr,
  ]
    .filter(Boolean)
    .join(" ");

  return matchStemmedTerms(searchContent, terms);
}

/**
 * Universal search match for Visas.
 * Fully equates "فيزا" and "تأشيرة" / "تاشيرة" so typing either finds all visa types.
 */
export function matchesVisa(
  visa: any,
  terms: string[],
  onlyActive = false,
): boolean {
  if (!visa) return false;
  if (onlyActive && visa.status !== "نشط") return false;
  if (terms.length === 0) return true;

  const featuresStr = parseStringArray(visa.features).join(" ");

  // Ensure visa entities naturally include both "فيزا" and "تاشيرة" keywords
  const searchContent = [
    visa.title,
    "فيزا تأشيرة تاشيرة",
    visa.description,
    visa.descriptionTitle,
    visa.price,
    visa.currency,
    visa.status,
    visa.processingTime,
    visa.duration,
    featuresStr,
  ]
    .filter(Boolean)
    .join(" ");

  return matchStemmedTerms(searchContent, terms);
}

/**
 * Universal search match for Destinations.
 */
export function matchesDestination(dest: any, terms: string[]): boolean {
  if (!dest) return false;
  if (terms.length === 0) return true;

  const searchContent = [dest.name, dest.description, dest.category]
    .filter(Boolean)
    .join(" ");

  return matchStemmedTerms(searchContent, terms);
}

/**
 * Universal search match for Bookings.
 * Handles client names, phone numbers, passport numbers, emails, booking IDs, service types, and dates.
 */
export function matchesBooking(booking: any, terms: string[]): boolean {
  if (!booking) return false;
  if (terms.length === 0) return true;

  // Map serviceType to Arabic terms for searchability
  let serviceTypeAr = "";
  const sType = String(booking.serviceType || booking.service || "").toLowerCase();
  if (sType.includes("flight")) serviceTypeAr = "طيران تذكرة طيران تذاكر رحلة";
  else if (sType.includes("hotel")) serviceTypeAr = "فندق فنادق حجز فندقي اقامة";
  else if (sType.includes("visa")) serviceTypeAr = "تاشيرة تاشيرات فيزا فيز";
  else if (sType.includes("umrah")) serviceTypeAr = "عمرة عمرات مكة المدينة";
  else if (sType.includes("insurance")) serviceTypeAr = "تأمين تامين سفر";
  else if (sType.includes("company")) serviceTypeAr = "شركات شركة تاسيس";

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
    booking.flightFrom,
    booking.flightTo,
    booking.flightType,
    booking.flightClass,
    booking.hotelDestination,
    booking.hotelType,
    booking.hotelRating,
    booking.visaType,
    booking.visaNationality,
    booking.visaPurpose,
    booking.insuranceType,
    booking.insuranceDuration,
    booking.companyName,
    booking.companyType,
    booking.companyLocation,
  ]
    .filter(Boolean)
    .join(" ");

  return matchStemmedTerms(searchContent, terms);
}

/**
 * Universal search match for Subscribers.
 */
export function matchesSubscriber(subscriber: any, terms: string[]): boolean {
  if (!subscriber) return false;
  if (terms.length === 0) return true;

  const formattedDateAr = subscriber.created_at
    ? new Date(subscriber.created_at).toLocaleDateString("ar-EG")
    : "";
  const formattedDateEn = subscriber.created_at
    ? new Date(subscriber.created_at).toLocaleDateString("en-US")
    : "";

  const searchContent = [
    subscriber.id,
    subscriber.name,
    subscriber.phone,
    subscriber.email,
    subscriber.created_at,
    formattedDateAr,
    formattedDateEn,
  ]
    .filter(Boolean)
    .join(" ");

  return matchStemmedTerms(searchContent, terms);
}
