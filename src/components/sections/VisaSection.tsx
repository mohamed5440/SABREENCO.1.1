import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, Zap } from "lucide-react";
import { optimizeImageUrl } from "../../lib/utils";
import { HighlightCurve } from "../ui";

import { Visa } from "../../types";

interface VisaSectionProps {
  onNavigate: (page: string, service?: string, context?: any) => void;
  visas?: Visa[];
}

export const VisaSection: React.FC<VisaSectionProps> = React.memo(({
  onNavigate,
  visas = [],
}) => {
  return (
    <section
      id="visa-section"
      className="py-10 md:py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative z-10 text-right"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-800 mb-6 leading-tight">
              حلول تأشيرة <br className="hidden md:block" />
              <HighlightCurve >
                سريعة وموثوقة
              </HighlightCurve>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-8 leading-relaxed font-medium max-w-lg">
              نحن نوفر لك أسرع وأسهل طريقة للحصول على تأشيرات الدخول مع متابعة
              دقيقة لطلبك أونلاين بالكامل. لدينا حالياً{" "}
              {visas.length > 0
                ? `${visas.length} أنواع مختلفة من التأشيرات`
                : "مجموعة متنوعة من التأشيرات"}{" "}
              المتاحة.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-10">
              {[
                "سياحة داخلية",
                "سياحة خارجية",
                "تأشيرة الإمارات",
                "رحلات عمرة",
                "حجز طيران",
                "حجز فنادق",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-primary/5 border border-gray-200 hover:border-primary/20 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 group-hover:text-primary shrink-0 transition-colors">
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate("booking", "visa")}
              className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-medium text-sm transition-all duration-300 w-full sm:w-auto flex items-center justify-center active:scale-95"
            >
              ابدأ طلب التأشيرة
            </button>
          </motion.div>

          {/* Left Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative mt-6 lg:mt-0 max-w-sm sm:max-w-md mx-auto"
          >
            {/* Abstract Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-[80px] pointer-events-none -z-10"></div>

            <div className="rounded-xl overflow-hidden relative z-10 border border-gray-200 aspect-[5/4]">
              <img
                decoding="async"
                loading="lazy"
                src={optimizeImageUrl(
                  "https://i.postimg.cc/rw6dCDcG/file-0000000082e87243ae9ce4e1bb7b6478.png",
                  800,
                )}
                alt="Visa Image"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                width="800"
                height="800"
              />
            </div>

            {/* Floating Badges */}
            <div className="absolute right-2 sm:-right-4 top-4 sm:top-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 pr-4 rounded-xl border border-gray-200 flex items-center gap-3 z-20 animate-bounce-slow">
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium text-gray-800 leading-tight mb-0.5">
                  موافقة سريعة
                </p>
                <p className="text-3xs sm:text-xs text-gray-500 font-medium">خلال 48 ساعة</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <CheckCircle2 size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div
              className="absolute left-2 sm:-left-4 bottom-4 sm:bottom-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 pl-4 rounded-xl border border-gray-200 flex items-center gap-3 z-20 animate-bounce-slow"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <Zap size={18} strokeWidth={2.5} />
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium text-gray-800 leading-tight mb-0.5">
                  إجراءات مبسطة
                </p>
                <p className="text-3xs sm:text-xs text-gray-500 font-medium">
                  أونلاين بالكامل
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});
