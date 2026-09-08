import React, { useState, useMemo } from "react";
import { OfferCard } from "../components/sections/OfferCard";
import { Offer } from "../types";
import { Search, X, Compass, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getSearchTerms, matchesOffer } from "../lib/searchUtils";
import { HighlightCurve } from "../components/ui";

interface OffersPageProps {
  onNavigate: (page: string, service?: string, context?: any) => void;
  offers: Offer[];
  onViewDetails: (offer: Offer) => void;
  context?: any;
}

export const OffersPage: React.FC<OffersPageProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onNavigate,
  offers,
  onViewDetails,
  context,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [destinationFilter, setDestinationFilter] = useState(
    context?.filter || "",
  );
  const [prevFilter, setPrevFilter] = useState(context?.filter);

  if (context?.filter !== prevFilter) {
    setPrevFilter(context?.filter);
    setDestinationFilter(context?.filter || "");
  }

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Extract dynamic list of categories from active offers
  const categories = useMemo(() => {
    const cats = new Set<string>();
    (offers || []).forEach((o) => {
      if (o.status === "نشط" && o.category) {
        cats.add(o.category);
      }
    });
    return ["الكل", ...Array.from(cats)];
  }, [offers]);

  // Perform filtering using diacritics-insensitive, Alif-insensitive Arabic logic
  const filteredOffers = useMemo(() => {
    const terms = getSearchTerms(searchQuery);
    return (offers || []).filter((offer) => {
      const matchesSearchAndDest = matchesOffer(
        offer,
        terms,
        destinationFilter,
        true,
      );
      const matchesCat =
        selectedCategory === "الكل" || offer.category === selectedCategory;
      return matchesSearchAndDest && matchesCat;
    });
  }, [offers, searchQuery, destinationFilter, selectedCategory]);

  return (
    <div
      className="py-10 md:py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
      dir="rtl"
    >
      {/* Hero Header Section */}
      <div className="section-header-unified">
        <h1 className="heading-unified">
          أحدث{" "}
          <HighlightCurve>العروض السياحية</HighlightCurve>
        </h1>
        <p className="description-unified">
          اكتشف أفضل العروض والخصومات على الرحلات السياحية حول العالم. باقات
          متكاملة تشمل الطيران والفنادق والجولات السياحية المميزة.
        </p>
      </div>

      {/* Robust Search and Filtering Bar */}
      <div className="bg-white rounded-xl md:rounded-xl border border-gray-200 p-4 md:p-6 mb-8 md:mb-12">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Main Search Input */}
          <div className="relative flex-1 group">
            <Search
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors"
            />
            <input
              type="text"

              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pr-12 pl-4 h-12 md:h-14 text-sm md:text-base font-medium text-gray-800 focus:outline-none focus:border-primary transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary p-1 hover:bg-primary-light rounded-xl transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Filters toggle for small screens */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="lg:hidden flex items-center justify-center gap-2 px-5 py-3.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 hover:bg-gray-100 transition-all"
            >
              <SlidersHorizontal size={18} />
              <span>الفئات ({selectedCategory})</span>
            </button>
          </div>

          {/* Desktop Categories Scrollbar */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto max-w-full py-1">
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 active:scale-95 whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-primary text-white"
                      : "bg-white text-gray-500 hover:bg-gray-200/60 hover:text-gray-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile categories drawer / accordion */}
        <AnimatePresence>
          {isFilterMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsFilterMenuOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 active:scale-95 whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-primary text-white"
                      : "bg-white text-gray-500 hover:bg-gray-200/60 hover:text-gray-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Destination Filter Badge */}
        {destinationFilter && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 w-fit animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary-dark rounded-xl text-xs md:text-sm font-medium border border-primary/20">
              <Compass size={14} className="animate-spin-slow text-primary" />
              <span>تصفية حسب الوجهة: {destinationFilter}</span>
              <button
                onClick={() => setDestinationFilter("")}
                className="p-0.5 hover:bg-primary/10 rounded-full transition-colors"
                title="إلغاء التصفية"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Results */}
      {filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in duration-500">
          {filteredOffers.map((offer, idx) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              idx={idx}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        /* Gorgeous Empty State */
        <div className="py-16 md:py-24 text-center bg-white border border-gray-200 rounded-xl md:rounded-xl p-6">
          <div className="w-20 h-20 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 mx-auto mb-6">
            <Compass size={40} className="stroke-[1.5]" />
          </div>
          <h3 className="text-xl md:text-2xl font-medium text-gray-800 mb-2">
            لم نجد عروضاً مطابقة لبحثك
          </h3>
          <p className="text-base text-gray-500 max-w-md mx-auto mb-8 font-medium">
            جرب كتابة كلمات مفتاحية أخرى، أو ابحث في تصنيف مختلف للعثور على
            وجهتك المفضلة.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("الكل");
              setDestinationFilter("");
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition-all active:scale-95"
          >
            إعادة تعيين البحث والفلترة
          </button>
        </div>
      )}
    </div>
  );
};
