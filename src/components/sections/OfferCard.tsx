import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Clock, ArrowLeft, ArrowUpLeft, MapPin, ZoomIn, X } from "lucide-react";
import { Offer } from "../../types";
import { optimizeImageUrl, getWhatsAppBookingUrl } from "../../lib/utils";

interface OfferCardProps {
  offer: Offer;
  idx: number;
  onViewDetails: (offer: Offer) => void;
}

export const OfferCard: React.FC<OfferCardProps> = React.memo(({
  offer,
  idx,
  onViewDetails,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: idx * 0.1, duration: 0.6 }}
        className="group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:border-primary/20 flex flex-col h-full cursor-pointer text-right"
        onClick={() => onViewDetails(offer)}
        dir="rtl"
      >
        {/* Top Image Area with full image preservation inside 5:4 aspect ratio container */}
        <div className="w-full aspect-[5/4] bg-[#eaedf1] overflow-hidden relative shrink-0 border-b border-gray-200 group/image flex items-center justify-center p-2.5 sm:p-3">
          {/* Soft Ambient Blur Glow */}
          <img
            loading="lazy"
            decoding="async"
            src={offer.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-125 select-none pointer-events-none"
            aria-hidden="true"
          />

          {/* Foreground Main Image (Full uncropped poster view in compact size) */}
          <img
            decoding="async"
            loading="lazy"
            src={optimizeImageUrl(offer.image, 800)}
            alt={offer.title}
            className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-sm border border-black/5 group-hover:scale-[1.03] transition-all duration-500 ease-out"
            referrerPolicy="no-referrer"
          />

          {/* Destination floating badge */}
          <div className="absolute bottom-3 right-3 z-20">
            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-2xs font-semibold border border-white/20 flex items-center gap-1.5 shadow-sm">
              <MapPin size={10} className="text-white" />
              {offer.destination || "وجهة مختارة"}
            </div>
          </div>

          {/* Expand Image Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsImageModalOpen(true);
            }}
            className="absolute bottom-3 left-3 z-20 bg-black/70 hover:bg-primary text-white backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-white/20 transition-all duration-300 flex items-center gap-1.5 text-2xs font-bold hover:scale-105 active:scale-95 group/btn cursor-pointer"
            title="تكبير الصورة بالكامل"
            aria-label="تكبير الصورة بالكامل"
          >
            <ZoomIn size={14} className="text-white group-hover/btn:scale-110 transition-transform" />
            <span>تكبير</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1.5 mt-0 tracking-normal group-hover:text-primary transition-colors line-clamp-1">
            {offer.title}
          </h3>

          {/* Price & Duration Row */}
          <div className="flex items-center justify-between gap-2 mb-3 mt-1">
            {/* Duration (Right side in RTL) */}
            <div className="flex items-center gap-1.5 text-gray-800 bg-white px-2 sm:px-2.5 py-1.5 rounded-xl border border-gray-200 text-3xs sm:text-2xs font-medium shrink-0">
              <Clock size={12} className="text-primary" />
              <span>{offer.duration}</span>
            </div>

            {/* Price (Left side in RTL) */}
            <div className="text-lg sm:text-xl font-bold text-primary flex items-baseline gap-1 shrink-0">
              <span className="text-[10px] font-normal ml-1">
                يبدأ من
              </span>
              <span>{offer.price}</span>
              <span className="text-xs font-semibold mr-1">
                {offer.currency || "EGP"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-auto">
            {/* Order / Book Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = getWhatsAppBookingUrl(offer);
                try {
                  window.open(url, "_blank", "noopener,noreferrer");
                } catch (e) {
                  console.warn("window.open blocked in sandbox", e);
                }
              }}
              className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 px-3 rounded-xl font-medium text-xs md:text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>اطلب حجز</span>
              <ArrowLeft size={14} />
            </button>

            {/* View Details Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(offer);
              }}
              className="flex-1 bg-white text-gray-800 hover:text-primary py-2.5 px-3 rounded-xl font-medium text-xs md:text-sm border border-gray-200 hover:border-primary/20 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>التفاصيل</span>
              <ArrowUpLeft size={14} className="rotate-45" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Image Modal */}
      {isImageModalOpen && createPortal(
        <AnimatePresence>
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageModalOpen(false);
            }}
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 left-4 md:top-6 md:left-6 text-white bg-black/50 hover:bg-black/70 p-2.5 rounded-full backdrop-blur-md transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsImageModalOpen(false);
                }}
              >
                <X size={24} />
              </button>
              <img
                loading="lazy"
                decoding="async"
                src={offer.image}
                alt={offer.title}
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-0 right-0 text-center text-white/90 text-sm md:text-base px-4">
                {offer.title}
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
});
