import React from "react";
import { motion } from "motion/react";
import { Offer } from "../../types";
import { OfferCard } from "./OfferCard";
import { HighlightCurve } from "../ui";

interface OffersSectionProps {
  onNavigate: (page: string, service?: string, context?: any) => void;
  offers: Offer[];
  onViewDetails: (offer: Offer) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = React.memo(({
  onNavigate,
  offers,
  onViewDetails,
}) => {
  const activeOffers = (offers || []).filter((o) => o.status === "نشط");

  return (
    <section
      id="offers-section"
      className="py-10 md:py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row sm:items-end items-start justify-between gap-5 mb-8 md:mb-10"
      >
        <div
          className="text-right cursor-pointer group/title flex-1"
          onClick={() => onNavigate("offers")}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-800 group-hover/title:text-primary transition-colors mb-3">
            وجهات مختارة{" "}
            <HighlightCurve>لك</HighlightCurve>
          </h2>
          <p className="text-sm md:text-base text-gray-500 font-medium max-w-full sm:max-w-[80%] md:max-w-2xl leading-relaxed">
            وجهات سياحية مختارة بعناية لتناسب تطلعاتك وتمنحك تجربة سفر لا تُنسى.
          </p>
        </div>
        <button
          onClick={() => onNavigate("offers")}
          className="group text-sm sm:text-base font-medium text-primary hover:text-primary-hover flex items-center gap-2 transition-all duration-300 active:scale-95 select-none self-start sm:self-auto shrink-0"
        >
          عرض كل الوجهات
          <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-light flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <motion.div whileHover={{ x: -2 }}>←</motion.div>
          </span>
        </button>
      </motion.div>

      {activeOffers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
          {activeOffers.slice(0, 3).map((offer, idx) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              idx={idx}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 border-dashed p-8 md:p-10 text-center">
          <p className="text-gray-500 font-medium">
            لا توجد عروض نشطة حالياً. يرجى مراجعة لوحة التحكم لإضافة عروض جديدة.
          </p>
        </div>
      )}
    </section>
  );
});
