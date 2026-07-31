import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  CheckCircle2,
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Headphones,
  ZoomIn,
  X,
} from "lucide-react";
import { Offer } from "../types";
import { getWhatsAppBookingUrl } from "../lib/utils";

interface OfferDetailsPageProps {
  offer: Offer | null;
  onNavigate: (page: string, service?: string, context?: any) => void;
  contactInfo?: any;
  socialLinks?: any[];
  isLoading?: boolean;
}

export const OfferDetailsPage: React.FC<OfferDetailsPageProps> = ({
  offer,
  onNavigate,
  isLoading,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    if (isImageModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isImageModalOpen]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
        <p className="text-lg font-medium text-gray-500 mb-6">
          لم يتم العثور على تفاصيل هذا العرض.
        </p>
        <button
          onClick={() => onNavigate("home")}
          className="px-8 py-3 bg-primary text-white rounded-full font-medium transition-all hover:scale-105"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white pb-12 md:pb-16" dir="rtl">
      {/* Soft Top Background */}
      <div className="w-full h-48 sm:h-64 md:h-80 bg-primary/5 absolute top-0 left-0 -z-10 rounded-b-[2rem] sm:rounded-b-[3rem] md:rounded-b-[5rem]"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 relative z-10">
        {/* Top Navigation */}
        <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-gray-200 w-fit max-w-full overflow-x-auto whitespace-nowrap hide-scrollbar flex-nowrap order-2 md:order-1">
            <button
              onClick={() => onNavigate("home")}
              className="shrink-0 text-xs font-medium text-gray-500 hover:text-primary transition-colors"
            >
              الرئيسية
            </button>
            <ArrowLeft size={12} className="shrink-0 text-border-dark" />
            <button
              onClick={() => onNavigate("offers")}
              className="shrink-0 text-xs font-medium text-gray-500 hover:text-primary transition-colors"
            >
              العروض
            </button>
            <ArrowLeft size={12} className="shrink-0 text-border-dark" />
            <span className="shrink-0 text-xs font-medium text-primary truncate max-w-[140px] sm:max-w-xs">
              {offer.title}
            </span>
          </div>

          <button
            onClick={() => onNavigate("offers")}
            className="flex items-center gap-3 text-gray-800 hover:text-primary transition-all font-medium group order-1 md:order-2 self-start md:self-auto"
          >
            <span className="text-base sm:text-lg md:text-xl">
              العودة للعروض
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
              <ArrowLeft size={18} className="rotate-180" />
            </div>
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Main Content Column */}
          <div className="md:col-span-7 lg:col-span-8 space-y-6 md:space-y-8">
            {/* Image Banner Container - Matching OfferCard 5:4 ratio layout */}
            <div className="w-full aspect-[5/4] rounded-xl overflow-hidden border border-gray-200/80 relative group bg-[#eaedf1] flex justify-center items-center p-4 sm:p-6 md:p-8 shadow-xs">
              {/* Soft Ambient Blur Background */}
              <img
                decoding="async"
                src={offer.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-125 select-none pointer-events-none"
                aria-hidden="true"
              />

              {/* Main Foreground Image (100% complete, uncropped poster view) */}
              <img
                decoding="async"
                loading="eager"
                fetchPriority="high"
                src={offer.image}
                alt={offer.title}
                className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-lg border border-black/5 transition-transform duration-500 group-hover:scale-[1.01]"
                referrerPolicy="no-referrer"
              />

              {/* Expand Fullscreen Button positioned at bottom left */}
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="absolute bottom-4 left-4 z-20 bg-black/70 hover:bg-primary text-white backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-white/20 transition-all duration-300 flex items-center gap-2 text-xs font-bold hover:scale-105 active:scale-95 group/btn cursor-pointer"
                title="عرض الصورة بالكامل"
                aria-label="عرض الصورة بالكامل"
              >
                <ZoomIn size={16} className="text-white group-hover/btn:scale-110 transition-transform" />
                <span>تكبير الصورة</span>
              </button>
            </div>

            {/* Content Title & Badges */}
            <div className="space-y-4 sm:space-y-5">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 leading-[1.3] flex items-center gap-2 sm:gap-3 flex-wrap">
                {offer.title}{" "}
                <span className="text-xl sm:text-2xl md:text-3xl">🔥</span>
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-primary/5 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-primary/10">
                  <Clock
                    size={16}
                    className="sm:w-[18px] sm:h-[18px]"
                    strokeWidth={2.5}
                  />
                  <span className="text-xs sm:text-sm font-medium">
                    المدة: {offer.duration}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-primary-light text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-primary/10">
                  <CheckCircle2
                    size={16}
                    className="sm:w-[18px] sm:h-[18px]"
                    strokeWidth={2.5}
                  />
                  <span className="text-xs sm:text-sm font-medium">
                    متاح للحجز
                  </span>
                </div>
                {offer.destination && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-200">
                    <MapPin size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="text-xs sm:text-sm font-medium">
                      {offer.destination}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            <section className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-gray-200">
              <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
                <div className="accent-line"></div>
                برنامج الرحلة التفصيلي
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-500 leading-[1.8] md:leading-[2] font-medium whitespace-pre-wrap">
                {offer.description ||
                  "استمتع برحلة لا تُنسى مع برنامجنا السياحي المتكامل."}
              </p>
            </section>

          </div>

          {/* Sidebar Area - Pricing & Booking */}
          <aside className="md:col-span-5 lg:col-span-4 md:sticky md:top-24 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6 relative overflow-hidden group hover:border-primary/20 transition-colors">
              {/* Pricing Section */}
              <div className="mb-5 sm:mb-6 pt-2 text-center">
                <div className="flex items-baseline justify-center gap-1.5 text-primary flex-wrap">
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-normal">
                    {offer.price}
                  </span>
                  <span className="text-sm sm:text-base md:text-lg lg:text-xl font-medium uppercase">
                    {offer.currency || "جنيه مصري"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-gray-200/50 mb-5 sm:mb-6 w-full"></div>

              {/* Highlights List */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 text-gray-800 font-medium text-xs sm:text-sm">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <ShieldCheck size={15} />
                  </div>
                  <span>تأكيد فوري للحجز</span>
                </div>
                <div className="flex items-center gap-3 text-gray-800 font-medium text-xs sm:text-sm">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <span>ضمان أقل سعر متوفر</span>
                </div>
                <div className="flex items-center gap-3 text-gray-800 font-medium text-xs sm:text-sm">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <Headphones size={15} />
                  </div>
                  <span>دعم فني وتوجيه 24/7</span>
                </div>
              </div>

              {/* Call to Action */}
              <div className="space-y-4">
                {/* WhatsApp Fast Booking (Styled with Original Primary Theme) */}
                <button
                  onClick={() => {
                    const url = getWhatsAppBookingUrl(offer);
                    try {
                      window.open(url, "_blank", "noopener,noreferrer");
                    } catch (e) {
                      console.warn("window.open blocked in sandbox", e);
                    }
                  }}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-4 md:py-5 rounded-xl font-medium text-base sm:text-lg md:text-xl transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-95 cursor-pointer"
                >
                  <span>أرسل طلب حجز الآن</span>
                  <ArrowLeft
                    size={20}
                    className="group-hover:-translate-x-1 transition-transform"
                  />
                </button>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-3xs sm:text-2xs md:text-xs text-gray-800 font-medium leading-[1.8] text-right">
                    <span className="text-primary block mb-1 underline font-bold">
                      ملاحظة هامة:
                    </span>
                    سيقوم فريقنا بالتواصل معك فور تلقي طلبك عبر واتساب لتأكيد المواعيد وتوافر الأماكن النهائية.
                  </p>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </main>

      {/* Fullscreen Image Lightbox Modal */}
      {isImageModalOpen &&
        createPortal(
          <AnimatePresence>
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
              onClick={() => setIsImageModalOpen(false)}
              dir="rtl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-4 left-4 md:top-6 md:left-6 text-white bg-black/60 hover:bg-primary p-3 rounded-full backdrop-blur-md transition-all z-20 shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
                  onClick={() => setIsImageModalOpen(false)}
                  title="إغلاق"
                  aria-label="إغلاق"
                >
                  <X size={24} />
                </button>
                <img
                  loading="lazy"
                  decoding="async"
                  src={offer.image}
                  alt={offer.title}
                  className="max-w-full max-h-[88vh] object-contain rounded-xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-4 text-center text-white/90 text-sm md:text-base font-semibold bg-black/40 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10">
                  {offer.title}
                </div>
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
