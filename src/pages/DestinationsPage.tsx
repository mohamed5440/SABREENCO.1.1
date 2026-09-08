import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { MapPin, ArrowUpLeft, Search, X, Compass } from "lucide-react";
import { optimizeImageUrl } from "../lib/utils";
import { HighlightCurve, HighlightText } from "../components/ui";
import { getSearchTerms, matchesDestination } from "../lib/searchUtils";

interface DestinationsPageProps {
  onNavigate: (page: string, service?: string, context?: any) => void;
  destinations: any[];
}

export const DestinationsPage: React.FC<DestinationsPageProps> = ({
  onNavigate,
  destinations,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDestinations = useMemo(() => {
    const terms = getSearchTerms(searchQuery);
    return (destinations || []).filter((dest) =>
      matchesDestination(dest, terms)
    );
  }, [destinations, searchQuery]);

  return (
    <section
      id="destinations-page"
      className="py-10 md:py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
      dir="rtl"
    >
      <div className="section-header-unified">
        <h1 className="heading-unified">
          وجهاتنا{" "}
          <HighlightCurve>السياحية</HighlightCurve>
        </h1>
        <p className="description-unified">
          نأخذك في رحلة إلى أجمل بقاع الأرض. اكتشف وجهاتنا المتنوعة واختر رحلتك
          القادمة مع <span className="text-primary font-medium">صابرينكو</span>{" "}
          بأفضل الباقات.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mb-8 md:mb-12">
        <div className="relative group">
          <Search
            size={20}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            placeholder="ابحث عن وجهة، دولة، تصنيف، أو تفاصيل الوجهة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pr-12 pl-12 h-12 md:h-14 text-sm md:text-base font-medium text-gray-800 focus:outline-none focus:border-primary transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary p-1 hover:bg-primary-light rounded-xl transition-all cursor-pointer"
              title="مسح البحث"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filteredDestinations.map((dest, idx) => (
            <motion.div
              key={dest.id}
              id={`dest-${dest.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="group relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer transition-all duration-500 bg-white border border-gray-200"
              onClick={() =>
                onNavigate("offers", undefined, { filter: dest.name })
              }
            >
              <img
                decoding="async"
                loading="lazy"
                src={optimizeImageUrl(dest.image, 800)}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
                width="400"
                height="500"
              />
              {/* Soft gradient from bottom to top */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent transition-opacity duration-300"></div>

              <div className="absolute top-6 left-6">
                <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white label-caps border border-white/20 flex items-center gap-1.5">
                  <MapPin size={12} className="text-white" />
                  {dest.category}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex flex-col justify-end transform transition-transform duration-300">
                <h3 className="text-2xl md:text-3xl font-medium text-white mb-2 tracking-normal group-hover:text-primary-light transition-colors">
                  <HighlightText text={dest.name} search={searchQuery} />
                </h3>
                <p className="text-white/80 text-xs md:text-sm font-medium line-clamp-2 leading-[1.6] mb-5">
                  <HighlightText text={dest.description} search={searchQuery} />
                </p>

                <div className="flex items-center gap-2 text-white font-medium text-sm bg-white/10 hover:bg-primary backdrop-blur-sm self-start px-4 py-2 rounded-xl transition-colors border border-white/20 hover:border-primary">
                  عروض الوجهة
                  <ArrowUpLeft size={16} className="rotate-45" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-16 md:py-24 text-center bg-white border border-gray-200 rounded-xl md:rounded-xl p-6">
          <div className="w-20 h-20 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 mx-auto mb-6">
            <Compass size={40} className="stroke-[1.5]" />
          </div>
          <h3 className="text-xl md:text-2xl font-medium text-gray-800 mb-2">
            لم نجد وجهات مطابقة لبحثك
          </h3>
          <p className="text-base text-gray-500 max-w-md mx-auto mb-8 font-medium">
            جرب كتابة كلمات مفتاحية أخرى، أو ابحث باسم المدينة أو الدولة.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition-all active:scale-95 cursor-pointer"
          >
            إعادة تعيين البحث
          </button>
        </div>
      )}
    </section>
  );
};
