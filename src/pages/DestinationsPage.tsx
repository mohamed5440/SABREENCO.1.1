import React from "react";
import { motion } from "motion/react";
import { MapPin, ArrowUpLeft } from "lucide-react";
import { optimizeImageUrl } from "../lib/utils";
import { HighlightCurve } from "../components/ui";

interface DestinationsPageProps {
  onNavigate: (page: string, service?: string, context?: any) => void;
  destinations: any[];
}

export const DestinationsPage: React.FC<DestinationsPageProps> = ({
  onNavigate,
  destinations,
}) => {
  return (
    <section
      id="destinations-page"
      className="py-10 md:py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {destinations.map((dest, idx) => (
          <motion.div
            key={dest.id}
            id={`dest-${dest.id}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            className="group relative overflow-hidden rounded-xl aspect-[5/4] cursor-pointer transition-all duration-500 bg-white border border-gray-200"
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
                {dest.name}
              </h3>
              <p className="text-white/80 text-xs md:text-sm font-medium line-clamp-2 leading-[1.6] mb-5">
                {dest.description}
              </p>

              <div className="flex items-center gap-2 text-white font-medium text-sm bg-white/10 hover:bg-primary backdrop-blur-sm self-start px-4 py-2 rounded-xl transition-colors border border-white/20 hover:border-primary">
                عروض الوجهة
                <ArrowUpLeft size={16} className="rotate-45" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
