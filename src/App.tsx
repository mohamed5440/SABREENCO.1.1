import React, { useState, useEffect, Suspense, lazy, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { apiService } from "./lib/apiService";

import { ErrorBoundary, Header, Footer } from "./components/layout";
import { Hero } from "./components/sections/Hero";
import { CheckCircle, AlertCircle } from "lucide-react";

const BookingPage = lazy(() =>
  import("./pages/BookingPage").then((m) => ({ default: m.BookingPage })),
);
const Offers = lazy(() =>
  import("./components/sections/OffersSection").then((m) => ({
    default: m.OffersSection,
  })),
);
const VisaSection = lazy(() =>
  import("./components/sections/VisaSection").then((m) => ({
    default: m.VisaSection,
  })),
);
const Features = lazy(() =>
  import("./components/sections/Features").then((m) => ({
    default: m.Features,
  })),
);
const LoginModal = lazy(() =>
  import("./components/auth/LoginModal").then((m) => ({
    default: m.LoginModal,
  })),
);
const OffersPage = lazy(() =>
  import("./pages/OffersPage").then((m) => ({ default: m.OffersPage })),
);
const ContactPage = lazy(() =>
  import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const FlightsPage = lazy(() =>
  import("./pages/FlightsPage").then((m) => ({ default: m.FlightsPage })),
);
const HotelsPage = lazy(() =>
  import("./pages/HotelsPage").then((m) => ({ default: m.HotelsPage })),
);
const VisaPage = lazy(() =>
  import("./pages/VisaPage").then((m) => ({ default: m.VisaPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const DestinationsPage = lazy(() =>
  import("./pages/DestinationsPage").then((m) => ({
    default: m.DestinationsPage,
  })),
);
const OfferDetailsPage = lazy(() =>
  import("./pages/OfferDetailsPage").then((m) => ({
    default: m.OfferDetailsPage,
  })),
);
const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [appToast, setAppToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showAppToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setAppToast({ message, type });
    setTimeout(() => setAppToast(null), 3000);
  };
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname;
    if (path === "/admin-login") {
      return "home"; // will trigger modal opening in useEffect
    }
    const cleanPath = path.replace(/\/$/, "");
    if (cleanPath === "/booking") return "booking";
    if (cleanPath === "/flights") return "flights";
    if (cleanPath === "/hotels") return "hotels";
    if (cleanPath === "/destinations") return "destinations";
    if (cleanPath === "/offers") return "offers";
    if (cleanPath === "/offer-details") return "offer-details";
    if (cleanPath === "/visa") return "visa";
    if (cleanPath === "/about") return "about";
    if (cleanPath === "/contact") return "contact";
    if (cleanPath === "/dashboard") return "dashboard";
    return "home";
  });
  const [bookingService, setBookingService] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("service") || "flight";
  });
  const [bookingContext, setBookingContext] = useState<any>(() => {
    const params = new URLSearchParams(window.location.search);
    const offerName = params.get("offerName");
    return offerName ? { offerName } : null;
  });

  // Unified Global Site State with LocalStorage-based Stale-While-Revalidate caching for instant rendering
  const [siteData, setSiteData] = useState(() => {
    const defaultData = {
      offers: [] as any[],
      destinations: [] as any[],
      bookings: [] as any[],
      visas: [] as any[],
      socialLinks: [
        {
          platform: "facebook",
          url: "https://www.facebook.com/share/1C6WokSrAE/",
        },
        { platform: "whatsapp", url: "https://wa.me/201553004593" },
      ] as any[],
      contactInfo: {
        phones: ["+201553004593", "+201103103362", "+201154162244"],
        email: "reservation@sabreentourism.com",
        address:
          "صابرينكو للخدمات السياحية - روكسي - الدور السادس - مصر الجديده - القاهرة",
        addressUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.035409391062!2d31.318522524987564!3d30.09317221626129!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x245c4f197382d62b%3A0xef6ed84fa3f29564!2z2LXYp9io2LHZitmG2YPZiCDZhNmE2K7Yr9mF2KfYqiDYp9mE2LPZitin2K3Zitip!5e0!3m2!1sar!2seg!4v1782998635960!5m2!1sar!2seg",
      } as any,
    };

    try {
      const cached = localStorage.getItem("sabreen_init_data_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          return {
            ...defaultData,
            offers: parsed.offers || [],
            destinations: parsed.destinations || [],
            visas: parsed.visas || [],
            socialLinks: parsed.socialLinks || defaultData.socialLinks,
            contactInfo: parsed.contactInfo || defaultData.contactInfo,
          };
        }
      }
    } catch (e) {
      console.warn("Failed to parse cached init data", e);
    }
    return defaultData;
  });

  const [hasFetchedInit, setHasFetchedInit] = useState(false);

  // Fetch all data from MySQL
  const fetchData = useCallback(
    async (force = false) => {
      // If already fetched initial data, skip refetching unless forced
      if (hasFetchedInit && !force) return;

      try {
        const user = await apiService.getCurrentUser().catch(() => null);
        if (user) {
          setIsLoggedIn(true);
          setCurrentUser(user);
        }

        // Handle URL-based login trigger
        if (window.location.pathname === "/admin-login") {
          setIsLoginOpen(true);
        }

        const [initData, bookings] = await Promise.all([
          apiService.getInitData(force).catch(() => null),
          user ? apiService.getBookings().catch(() => []) : Promise.resolve([]),
        ]);

        if (initData) {
          setSiteData((prev) => {
            const newData = {
              ...prev,
              offers: initData.offers || [],
              destinations: initData.destinations || [],
              bookings: bookings || [],
              visas: initData.visas || [],
              socialLinks: initData.socialLinks?.length
                ? initData.socialLinks
                : prev.socialLinks,
              contactInfo: initData.contactInfo || prev.contactInfo,
            };
            try {
              localStorage.setItem("sabreen_init_data_cache", JSON.stringify({
                offers: newData.offers,
                destinations: newData.destinations,
                visas: newData.visas,
                socialLinks: newData.socialLinks,
                contactInfo: newData.contactInfo
              }));
            } catch (e) {
              console.warn("Failed to cache init data in localStorage", e);
            }
            return newData;
          });
        } else {
          // Fallback if init fails
          setSiteData((prev) => ({ ...prev, bookings: bookings || [] }));
        }
        setHasFetchedInit(true);
      } catch (error) {
        console.error("Error fetching data from API:", error);
      }
    },
    [hasFetchedInit],
  );

  useEffect(() => {
    if (window.location.pathname === "/admin-login") {
      setTimeout(() => setIsLoginOpen(true), 0);
      window.history.replaceState(null, "", "/");
    }
    setTimeout(() => {
      fetchData();
    }, 0);

    // Prefetch other core lazy loaded pages during idle time for instant transition speeds
    const prefetchPages = () => {
      import("./pages/BookingPage").catch(() => {});
      import("./pages/OffersPage").catch(() => {});
      import("./pages/ContactPage").catch(() => {});
      import("./pages/FlightsPage").catch(() => {});
      import("./pages/HotelsPage").catch(() => {});
      import("./pages/VisaPage").catch(() => {});
      import("./pages/DestinationsPage").catch(() => {});
      import("./pages/AboutPage").catch(() => {});
      // Prefetch lazy sections to make sure below-the-fold renders instantly
      import("./components/sections/OffersSection").catch(() => {});
      import("./components/sections/VisaSection").catch(() => {});
      import("./components/sections/Features").catch(() => {});
      import("./components/auth/LoginModal").catch(() => {});
    };
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => prefetchPages());
    } else {
      setTimeout(prefetchPages, 2000);
    }
  }, [fetchData]);

  // Recover selectedOffer from URL parameter or context if null on page load or refresh
  useEffect(() => {
    if (currentPage === "offer-details" && !selectedOffer && siteData.offers.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const urlOfferId = params.get("id") || bookingContext?.id;
      const urlOfferName = params.get("offerName") || bookingContext?.offerName;
      
      let found = null;
      if (urlOfferId) {
        found = siteData.offers.find((o) => String(o.id) === String(urlOfferId));
      }
      if (!found && urlOfferName) {
        const decodedName = decodeURIComponent(urlOfferName);
        found = siteData.offers.find(
          (o) => o.title === decodedName || o.name === decodedName
        );
      }

      if (found) {
        requestAnimationFrame(() => setSelectedOffer(prev => prev || found));
      }
    }
  }, [currentPage, selectedOffer, siteData.offers, bookingContext]);

  // Dynamically update document title based on current page and selected offer
  useEffect(() => {
    const titleMap: Record<string, string> = {
      home: "صابرينكو للخدمات السياحية - الرئيسية",
      booking: "صابرينكو للخدمات السياحية - طلب حجز",
      flights: "صابرينكو للخدمات السياحية - حجز طيران",
      hotels: "صابرينكو للخدمات السياحية - حجز فنادق",
      destinations: "صابرينكو للخدمات السياحية - الوجهات السياحية",
      offers: "صابرينكو للخدمات السياحية - أحدث العروض",
      visa: "صابرينكو للخدمات السياحية - خدمات التأشيرات",
      about: "صابرينكو للخدمات السياحية - من نحن",
      contact: "صابرينكو للخدمات السياحية - اتصل بنا",
      dashboard: "صابرينكو للخدمات السياحية - لوحة التحكم",
    };

    if (currentPage === "offer-details" && selectedOffer) {
      document.title = `${selectedOffer.title || selectedOffer.name || "تفاصيل العرض"} - صابرينكو للخدمات السياحية`;
    } else if (titleMap[currentPage]) {
      document.title = titleMap[currentPage];
    } else {
      document.title = "صابرينكو للخدمات السياحية";
    }
  }, [currentPage, selectedOffer]);

  // Handle browser back and forward button clicks smoothly to improve website architecture
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const cleanPath = path.replace(/\/$/, "");
      
      let page = "home";
      if (cleanPath === "/booking") page = "booking";
      else if (cleanPath === "/flights") page = "flights";
      else if (cleanPath === "/hotels") page = "hotels";
      else if (cleanPath === "/destinations") page = "destinations";
      else if (cleanPath === "/offers") page = "offers";
      else if (cleanPath === "/offer-details") page = "offer-details";
      else if (cleanPath === "/visa") page = "visa";
      else if (cleanPath === "/about") page = "about";
      else if (cleanPath === "/contact") page = "contact";
      else if (cleanPath === "/dashboard") page = "dashboard";
      
      const params = new URLSearchParams(window.location.search);
      const service = params.get("service") || "flight";
      const offerName = params.get("offerName");
      const id = params.get("id");
      
      setCurrentPage(page);
      setBookingService(service);
      
      let newContext: any = null;
      if (offerName || id) {
        newContext = {};
        if (offerName) newContext.offerName = offerName;
        if (id) newContext.id = id;
      }
      setBookingContext(newContext);
      
      if (["home", "offers", "destinations", "dashboard"].includes(page)) {
        fetchData(page === "dashboard" || isLoggedIn);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [fetchData, isLoggedIn]);

  const handleNavigate = useCallback(
    (page: string, service?: string, context?: any) => {
      if (page === "login") {
        setIsLoginOpen(true);
        return;
      }
      if (["home", "offers", "destinations", "dashboard"].includes(page)) {
        fetchData(page === "dashboard" || isLoggedIn);
      }
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      if (service) {
        setBookingService(service);
      }
      if (context) {
        setBookingContext(context);
      } else {
        setBookingContext(null);
      }

      // Update URL history to maintain perfect SPA routing
      const cleanPath = page === "home" ? "/" : `/${page}`;
      const params = new URLSearchParams();
      if (service) {
        params.set("service", service);
      }
      if (context?.offerName) {
        params.set("offerName", context.offerName);
      }
      if (context?.id) {
        params.set("id", context.id);
      }
      const searchStr = params.toString();
      const finalUrl = cleanPath + (searchStr ? `?${searchStr}` : "");
      
      if (window.location.pathname !== cleanPath || window.location.search !== (searchStr ? `?${searchStr}` : "")) {
        window.history.pushState({ page, service, context }, "", finalUrl);
      }
    },
    [fetchData, isLoggedIn],
  );

  const handleLoginSuccess = useCallback(async () => {
    setIsLoggedIn(true);
    try {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
      // Fetch authenticated data (like bookings) after login
      await fetchData(true);
    } catch (error) {
      console.error("Error fetching user after login:", error);
    }
    setCurrentPage("dashboard");
  }, [fetchData]);

  const handleLogout = useCallback(async () => {
    try {
      await apiService.signOut();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setSiteData((prev) => ({ ...prev, bookings: [] }));
      setCurrentPage("home");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggedIn(false);
      setCurrentUser(null);
      setSiteData((prev) => ({ ...prev, bookings: [] }));
      setCurrentPage("home");
    }
  }, []);

  if (currentPage === "dashboard") {
    if (hasFetchedInit && !isLoggedIn) {
      // Redirect to home and open login if not logged in
      setTimeout(() => {
        setCurrentPage("home");
        setIsLoginOpen(true);
        window.history.pushState({}, "", "/");
      }, 0);
      return <PageLoader />;
    }
    return (
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="h-screen w-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin"></div>
            </div>
          }
        >
          <DashboardPage
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            offers={siteData.offers}
            destinations={siteData.destinations}
            bookings={siteData.bookings}
            visas={siteData.visas}
            socialLinks={siteData.socialLinks}
            contactInfo={siteData.contactInfo}
            onRefresh={() => fetchData(true)}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div
        className="min-h-[100dvh] bg-white font-sans text-gray-800 selection:bg-primary/5 selection:text-primary-dark"
        dir="rtl"
      >
        <Header
          onNavigate={handleNavigate}
          currentPage={currentPage}
          isLoggedIn={isLoggedIn}
          socialLinks={siteData.socialLinks}
        />
        <main className="pt-[4.5rem] md:pt-[5rem] bg-white relative min-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Suspense fallback={<PageLoader />}>
                {currentPage === "home" && (
                  <>
                    <Hero onNavigate={handleNavigate} />
                    <Offers
                      onNavigate={handleNavigate}
                      offers={siteData.offers}
                      onViewDetails={(offer) => {
                        setSelectedOffer(offer);
                        handleNavigate("offer-details", undefined, { id: offer.id });
                      }}
                    />
                    <VisaSection
                      onNavigate={handleNavigate}
                      visas={siteData.visas}
                    />
                    <Features />
                  </>
                )}
                {currentPage === "booking" && (
                  <BookingPage
                    initialServiceType={bookingService}
                    context={bookingContext}
                    contactInfo={siteData.contactInfo}
                    socialLinks={siteData.socialLinks}
                    showAppToast={showAppToast}
                    onNavigate={handleNavigate}
                    onAddBooking={(booking: any) =>
                      setSiteData((prev) => ({
                        ...prev,
                        bookings: [booking, ...prev.bookings],
                      }))
                    }
                    currentUser={currentUser}
                  />
                )}
                {currentPage === "flights" && (
                  <FlightsPage onNavigate={handleNavigate} />
                )}
                {currentPage === "hotels" && (
                  <HotelsPage onNavigate={handleNavigate} />
                )}
                {currentPage === "destinations" && (
                  <DestinationsPage
                    onNavigate={handleNavigate}
                    destinations={siteData.destinations}
                  />
                )}
                {currentPage === "offers" && (
                  <OffersPage
                    onNavigate={handleNavigate}
                    offers={siteData.offers}
                    context={bookingContext}
                    onViewDetails={(offer) => {
                      setSelectedOffer(offer);
                      handleNavigate("offer-details", undefined, { id: offer.id });
                    }}
                  />
                )}
                {currentPage === "offer-details" && (
                  <OfferDetailsPage
                    offer={selectedOffer}
                    onNavigate={handleNavigate}
                    contactInfo={siteData.contactInfo}
                    socialLinks={siteData.socialLinks}
                    isLoading={!hasFetchedInit}
                  />
                )}
                {currentPage === "visa" && (
                  <VisaPage
                    onNavigate={handleNavigate}
                    visas={siteData.visas}
                    context={bookingContext}
                  />
                )}
                {currentPage === "about" && <AboutPage />}
                {currentPage === "contact" && (
                  <ContactPage
                    contactInfo={siteData.contactInfo}
                    socialLinks={siteData.socialLinks}
                  />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer
          onNavigate={handleNavigate}
          socialLinks={siteData.socialLinks}
          contactInfo={siteData.contactInfo}
        />

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <AnimatePresence>
          {appToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 50, x: "-50%" }}
              className={`fixed bottom-8 left-1/2 z-[200] px-4 md:px-6 py-3 md:py-4 rounded-xl border flex items-center justify-center text-center gap-2 md:gap-3 w-[90%] md:w-auto min-w-[300px] max-w-md ${
                appToast.type === "success"
                  ? "bg-primary-light text-primary border-primary-soft-border"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
              dir="rtl"
            >
              {appToast.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="font-medium text-sm">{appToast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
