import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const SABREENKO_LOGO_URL = "https://i.postimg.cc/t4cfJRBD/FB-IMG-1775329049732.jpg";
export const WHATSAPP_QR_URL = "https://i.postimg.cc/RCfFrC3W/Whats-App-Image-2026-04-21-at-6-54-29-PM.jpg";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility to parse strings, stringified JSON arrays, or arrays into a clean string array.
 */
export function parseStringArray(input: any): string[] {
  if (Array.isArray(input)) return input.map(String);
  if (!input) return [];
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // not JSON array
    }
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function optimizeImageUrl(url: string, width: number = 800) {
  if (!url) return "";
  if (url.includes("images.unsplash.com")) {
    const baseUrl = url.split("?")[0];
    return `${baseUrl}?auto=format&fm=webp&fit=max&q=80&w=${width}`;
  }
  if (url.includes("picsum.photos")) {
    if (!url.includes(".webp")) {
      return `${url.split("?")[0]}.webp?q=80`;
    }
  }
  return url;
}

/**
 * Utility to generate a WhatsApp booking link for a tourism offer.
 */
export function getWhatsAppBookingUrl(offer: {
  title: string;
  price: string | number;
  currency?: string;
  duration?: string;
  destination?: string;
}): string {
  let whatsappNumber = "201553004593";
  try {
    const cached = localStorage.getItem("sabreen_init_data_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.contactInfo) {
        let phones = parsed.contactInfo.phones;
        if (typeof phones === "string") {
          try {
            phones = JSON.parse(phones);
          } catch {
            phones = phones.split(",").map((p: string) => p.trim()).filter(Boolean);
          }
        }
        if (Array.isArray(phones) && phones[0]) {
          const cleaned = phones[0].replace(/[^\d+]/g, "").replace(/^\+/, "");
          if (cleaned) {
            whatsappNumber = cleaned;
          }
        }
      }
    }
  } catch (e) {
    console.warn("Error resolving dynamic WhatsApp number, falling back to default.", e);
  }

  const isCustomPrice = !offer.price || offer.price === "0" || offer.price.toString().includes("تواصل");
  const priceDisplay = isCustomPrice ? "تواصل لمعرفة السعر" : `${offer.price} ${offer.currency || "جنيه"}`;

  const text = `طلب حجز عرض جديد

---------------------------------

العرض: ${offer.title}
السعر: ${priceDisplay}
المدة: ${offer.duration || "غير محدد"}
الوجهة: ${offer.destination || "غير محدد"}

---------------------------------

أرجو التواصل معي لتأكيد الحجز وتنسيق التفاصيل. شكراً لكم!`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export async function compressImage(
  file: File,
  maxWidth = 1200,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as WEBP for smaller size, fallback to JPEG
        const dataUrl = canvas.toDataURL("image/webp", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

export function parsePhones(phones: any): string[] {
  if (Array.isArray(phones)) return phones.map(String);
  if (typeof phones === "string") {
    try {
      const parsed = JSON.parse(phones || "[]");
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return phones ? phones.split(/[,،]/).map((p: string) => p.trim()).filter(Boolean) : [];
    }
  }
  return [];
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "مكتمل":
      return "bg-green-100 text-green-700 border-green-200";
    case "نشط":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "قيد الانتظار":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "ملغي":
      return "bg-red-100 text-red-700 border-red-200";
    case "غير نشط":
      return "bg-gray-100 text-gray-500 border-gray-200";
    default:
      return "bg-gray-100 text-gray-500 border-gray-200";
  }
};

/**
 * Security utilities for input sanitization and validation.
 */
export const securityUtils = {
  /**
   * Sanitizes a string to prevent XSS and other injection attacks.
   * Removes HTML tags and trims whitespace.
   */
  sanitizeString(str: string): string {
    if (!str) return "";
    return str
      .replace(/<[^>]*>?/gm, "") // Remove HTML tags
      .replace(/[<>]/g, "") // Remove any remaining brackets
      .trim();
  },

  /**
   * Validates an email address.
   */
  isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Validates a phone number (basic check).
   */
  isValidPhone(phone: string): boolean {
    const re = /^\+?[0-9\s-]{8,20}$/;
    return re.test(phone);
  },

  /**
   * Validates file type for uploads.
   */
  isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  },
};
