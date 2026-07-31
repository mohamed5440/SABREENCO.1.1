import { Offer, Visa, Destination, Booking } from "../types";
import { parseStringArray } from "./utils";

// Constants
const CACHE_TTL = 300000; // 5 minutes

const inFlightRequests = new Map<string, Promise<any>>();

function getCachedData(key: string) {
  const memEntry = (globalThis as any)._apiCache?.[key];
  if (memEntry && Date.now() - memEntry.timestamp < CACHE_TTL) {
    return memEntry.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  const timestamp = Date.now();
  if (!(globalThis as any)._apiCache) (globalThis as any)._apiCache = {};
  (globalThis as any)._apiCache[key] = { data, timestamp };
}

function clearCache(key?: string) {
  if (key) {
    if ((globalThis as any)._apiCache) {
      delete (globalThis as any)._apiCache[key];
      delete (globalThis as any)._apiCache["init_data"]; // Always clear init_data when anything changes
    }
  } else {
    (globalThis as any)._apiCache = {};
  }
  inFlightRequests.clear();
}

let apiToken: string | null = localStorage.getItem("sabreen_token");

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const method = options.method || "GET";
  
  // Deduplicate concurrent GET requests to avoid duplicate network roundtrips
  if (method === "GET") {
    if (inFlightRequests.has(endpoint)) {
      return inFlightRequests.get(endpoint);
    }
  }

  const executeFetch = async () => {
    const headers: any = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const currentToken = apiToken || localStorage.getItem("sabreen_token");
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });
    if (!res.ok) {
      let errStr = `Error ${res.status}: ${res.statusText}`;
      try {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.error) {
            if (typeof data.error === "string") {
              errStr = data.error;
            } else if (typeof data.error === "object") {
              errStr = data.error.message || JSON.stringify(data.error);
            }
          } else if (data.message) {
            errStr = data.message;
          }
        } catch {
          // Not JSON, use the raw text if it's short
          if (text && text.length < 200) errStr = text;
        }
      } catch {
        // ignore
      }
      throw new Error(errStr);
    }
    return res.json();
  };

  if (method === "GET") {
    const promise = executeFetch().finally(() => {
      inFlightRequests.delete(endpoint);
    });
    inFlightRequests.set(endpoint, promise);
    return promise;
  }

  return executeFetch();
}

export const apiService = {
  setToken(token: string | null) {
    apiToken = token;
    if (token) {
      localStorage.setItem("sabreen_token", token);
    } else {
      localStorage.removeItem("sabreen_token");
    }
  },
  // Init Data (Optimized)
  async getInitData(force = false) {
    if (force) {
      clearCache();
    } else {
      const cached = getCachedData("init_data");
      if (cached) return cached;
    }

    const endpoint = force ? `/api/init?t=${Date.now()}` : "/api/init";
    const data = await fetchApi(endpoint);

    // Parse features and notIncluded for offers
    data.offers = (data.offers || []).map((item: any) => ({
      ...item,
      features: parseStringArray(item.features),
      notIncluded: parseStringArray(item.notIncluded),
    }));

    // Parse features for visas
    data.visas = (data.visas || []).map((item: any) => ({
      ...item,
      features: parseStringArray(item.features),
    }));

    // Parse phones for contactInfo
    if (data.contactInfo) {
      if (typeof data.contactInfo.phones === "string") {
        try {
          data.contactInfo.phones = JSON.parse(data.contactInfo.phones);
        } catch {
          data.contactInfo.phones = [];
        }
      } else if (!data.contactInfo.phones) {
        data.contactInfo.phones = [];
      }
    }

    setCachedData("init_data", data);

    // Also pre-populate individual caches
    setCachedData("offers", data.offers);
    setCachedData("destinations", data.destinations);
    setCachedData("visas", data.visas);
    setCachedData("social_links", data.socialLinks);
    setCachedData("contact_info", data.contactInfo);

    return data;
  },
  // Offers
  async getOffers() {
    const cached = getCachedData("offers");
    if (cached) return cached;

    const data = await fetchApi("/api/offers");
    setCachedData("offers", data);
    return data as Offer[];
  },
  async updateOffer(offer: Offer) {
    const { id, ...payload } = offer as any;
    const data = await fetchApi(`/api/offers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    clearCache("offers");
    return data[0] as Offer;
  },
  async addOffer(offer: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...payload } = offer;
    const data = await fetchApi("/api/offers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    clearCache("offers");
    return data[0] as Offer;
  },
  async deleteOffer(id: number) {
    await fetchApi(`/api/offers/${id}`, { method: "DELETE" });
    clearCache("offers");
  },

  // Visas
  async getVisas() {
    const cached = getCachedData("visas");
    if (cached) return cached;

    const data = await fetchApi("/api/visas");
    const parsed = (data || []).map((item: any) => ({
      ...item,
      features: parseStringArray(item.features),
    }));
    setCachedData("visas", parsed);
    return parsed as Visa[];
  },
  async updateVisa(visa: any) {
    const { id, ...visaData } = visa;
    const data = await fetchApi(`/api/visas/${id}`, {
      method: "PUT",
      body: JSON.stringify(visaData),
    });
    clearCache("visas");
    return data[0] as Visa;
  },
  async addVisa(visa: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...visaData } = visa;
    const data = await fetchApi("/api/visas", {
      method: "POST",
      body: JSON.stringify(visaData),
    });
    clearCache("visas");
    return data[0] as Visa;
  },
  async deleteVisa(id: number) {
    await fetchApi(`/api/visas/${id}`, { method: "DELETE" });
    clearCache("visas");
  },

  // Destinations
  async getDestinations() {
    const cached = getCachedData("destinations");
    if (cached) return cached;

    const data = await fetchApi("/api/destinations");
    setCachedData("destinations", data);
    return data as Destination[];
  },
  async updateDestination(destination: any) {
    const { id, ...payload } = destination;
    const data = await fetchApi(`/api/destinations/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    clearCache("destinations");
    return data[0] as Destination;
  },
  async addDestination(destination: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...payload } = destination;
    const data = await fetchApi("/api/destinations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    clearCache("destinations");
    return data[0] as Destination;
  },
  async deleteDestination(id: number) {
    await fetchApi(`/api/destinations/${id}`, { method: "DELETE" });
    clearCache("destinations");
  },

  // Sorting
  async updateSortOrder(
    table: "offers" | "visas" | "destinations",
    items: { id: any; sort_order: number }[],
  ) {
    await fetchApi("/api/sort-order", {
      method: "POST",
      body: JSON.stringify({ table, items }),
    });
    clearCache(table);
  },

  // Bookings
  async getBookings() {
    const data = await fetchApi("/api/bookings");
    return (data || []).map((item: any) => ({
      ...item,
      id: String(item.id),
      documents: parseStringArray(item.documents),
    })) as Booking[];
  },
  async addBooking(booking: any) {
    const data = await fetchApi("/api/bookings", {
      method: "POST",
      body: JSON.stringify(booking),
    });
    return data[0] as Booking;
  },
  async getBooking(id: string | number) {
    const data = await fetchApi(`/api/bookings/${id}`);
    if (data) {
      data.id = String(data.id);
      data.documents = parseStringArray(data.documents);
    }
    return data as Booking;
  },
  async updateBooking(booking: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, ...bookingData } = booking;
    const data = await fetchApi(`/api/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookingData),
    });
    return data[0] as Booking;
  },
  async updateBookingStatus(id: string | number, status: string) {
    const data = await fetchApi(`/api/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return data[0] as Booking;
  },
  async deleteBooking(id: string | number) {
    await fetchApi(`/api/bookings/${id}`, { method: "DELETE" });
  },

  // Social Links
  async getSocialLinks() {
    const cached = getCachedData("social_links");
    if (cached) return cached;

    const data = await fetchApi("/api/social_links");
    setCachedData("social_links", data);
    return data;
  },
  async updateSocialLinks(links: any[]) {
    await fetchApi("/api/social_links/bulk", {
      method: "POST",
      body: JSON.stringify(links),
    });
    clearCache("social_links");
    return links;
  },

  // Contact Info
  async getContactInfo() {
    const cached = getCachedData("contact_info");
    if (cached) return cached;

    const data = await fetchApi("/api/contact_info");
    if (data) {
      data.phones = parseStringArray(data.phones);
      setCachedData("contact_info", data);
    }
    return data;
  },
  async updateContactInfo(info: any) {
    const payload = { ...info };
    // Ensure we send valid JSON
    if (typeof payload.phones === "string") {
      payload.phones = parseStringArray(payload.phones);
    }

    const data = await fetchApi("/api/contact_info", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    clearCache("contact_info");
    return data[0];
  },

  // Auth
  async signIn(email: string, password: string) {
    const data = await fetchApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      this.setToken(data.token);
    }

    localStorage.setItem("auth_session", JSON.stringify(data.user));
    return { user: data.user, token: data.token };
  },
  async signOut() {
    this.setToken(null);
    localStorage.removeItem("auth_session");
  },
  async updatePassword(currentPassword: string, newPassword: string) {
    return await fetchApi("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Subscribers
  async subscribeToWhatsApp(phone: string, name?: string) {
    return await fetchApi("/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ phone, name }),
    });
  },
  async getSubscribers() {
    return (await fetchApi("/api/subscribers")) as any[];
  },
  async deleteSubscriber(id: number | string) {
    return await fetchApi(`/api/subscribers/${id}`, { method: "DELETE" });
  },

  async getCurrentUser() {
    const session = localStorage.getItem("auth_session");
    const token = localStorage.getItem("sabreen_token");
    if (session && token) {
      try {
        return JSON.parse(session);
      } catch {
        return null;
      }
    }
    return null;
  },
};
