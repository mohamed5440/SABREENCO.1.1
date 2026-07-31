import React, { useState, useMemo } from "react";
import {
  FileText,
  Calendar,
  Zap,
  CheckCircle,
  ShieldCheck,
  Clock,
  Search,
  X,
  Compass,
  ArrowLeft,
} from "lucide-react";
import { Visa } from "../types";
import { ServicePageLayout } from "../components/layout";
import { optimizeImageUrl } from "../lib/utils";
import { getSearchTerms, matchesVisa } from "../lib/searchUtils";

interface VisaPageProps {
  onNavigate: (page: string, service?: string, context?: any) => void;
  visas: Visa[];
}

export const VisaPage: React.FC<VisaPageProps> = ({ onNavigate, visas }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    {
      icon: <Zap size={28} />,
      title: "إنجاز سريع",
      description:
        "نضمن لك سرعة إصدار التأشيرة في زمن قياسي بفضل علاقاتنا المباشرة وخبرتنا الطويلة.",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "موثوقية تامة",
      description:
        "نلتزم بالشفافية الكاملة في الرسوم والإجراءات، ونوفر لك كافة الضمانات التي تضمن حقك.",
    },
    {
      icon: <Clock size={28} />,
      title: "دعم فني",
      description:
        "فريقنا متاح للرد على استفساراتك ومساعدتك في تجهيز الأوراق المطلوبة لضمان قبول الطلب.",
    },
  ];

  const activeVisas = useMemo(() => {
    const terms = getSearchTerms(searchQuery);
    return (visas || []).filter((v) => matchesVisa(v, terms, true));
  }, [visas, searchQuery]);

  return (
    <ServicePageLayout
      id="visa-page"
      badge="خدمة سريعة"
      title="خدمات"
      highlight="التأشيرات"
      description="نقدم خدمات استخراج تأشيرات زيارة الإمارات بسرعة وسهولة وبأسعار تنافسية لجميع الجنسيات مع دعم فني متكامل طوال العملية."
      features={features}
      ctaTitle="هل تحتاج إلى استشارة؟"
      ctaDescription="فريق خبرائنا جاهز لمساعدتك في اختيار نوع التأشيرة الأنسب لمخططات سفرك وشرح كافة التفاصيل المطلوبة."
      ctaButtonText="ارسل طلب تأشيرة"
      onCtaClick={() => onNavigate("booking", "visa")}
    >
      {/* Search Input Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 max-w-2xl mx-auto">
        <div className="relative group">
          <Search
            size={20}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"

            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pr-12 pl-4 h-12 text-sm md:text-base font-medium text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400"
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
      </div>

      {/* Visa Cards Section */}
      <div className="mb-8">
        {activeVisas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {activeVisas.map((visa) => (
              <div
                key={visa.id}
                className="bg-white rounded-xl border border-gray-200 flex flex-col hover:border-primary/20 transition-all duration-300 group overflow-hidden"
              >
                {/* Unified Image Container inside 5:4 aspect ratio */}
                <div className="w-full aspect-[5/4] bg-[#eaedf1] overflow-hidden relative shrink-0 border-b border-gray-200 group/image flex items-center justify-center p-2.5 sm:p-3">
                  {visa.image ? (
                    <>
                      {/* Ambient Blur Glow */}
                      <img
                        loading="lazy"
                        decoding="async"
                        src={visa.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-125 select-none pointer-events-none"
                        aria-hidden="true"
                      />
                      {/* Foreground Main Image (Uncropped) */}
                      <img
                        decoding="async"
                        loading="lazy"
                        src={optimizeImageUrl(visa.image, 600)}
                        alt={visa.title}
                        className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-sm border border-black/5 group-hover:scale-[1.03] transition-all duration-500 ease-out"
                        referrerPolicy="no-referrer"
                      />
                    </>
                  ) : (
                    <FileText size={48} strokeWidth={1} className="text-gray-400" />
                  )}
                </div>
                <div className="p-5 md:p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-medium text-gray-800 mb-2 tracking-normal">
                    {visa.title}
                  </h3>
                  <div className="text-3xl font-medium text-primary mb-4 flex items-baseline gap-1">
                    {visa.price}
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {visa.currency || "درهم"}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm text-gray-800 font-medium">
                      <Calendar size={18} className="text-primary shrink-0" />
                      المدة: {visa.duration}
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-800 font-medium">
                      <Clock size={18} className="text-primary shrink-0" />
                      الإنجاز: {visa.processingTime}
                    </li>
                    {(visa.features || []).map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-sm text-gray-800 font-medium"
                      >
                        <CheckCircle
                          size={18}
                          className="text-primary shrink-0"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => onNavigate("booking", "visa", { visaName: visa.title })}
                    className="w-full btn-primary-unified cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>قدم طلبك الآن</span>
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Search Results for Visa */
          <div className="py-12 text-center bg-white border border-gray-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 mx-auto mb-4">
              <Compass size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              لم نجد تأشيرات مطابقة لبحثك
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              يرجى التحقق من الكلمات المدخلة أو مسح البحث لعرض كل التأشيرات
              المتاحة.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-medium transition-all"
            >
              عرض جميع التأشيرات
            </button>
          </div>
        )}
      </div>

      {/* Required Documents Section */}
      <div className="bg-white rounded-xl p-4 md:p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl md:text-3xl font-medium text-gray-800 text-center mb-8 flex items-center justify-center gap-3">
          <div className="accent-line"></div>
          المستندات <span className="text-primary">المطلوبة</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center group">
            <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-medium text-xl mx-auto mb-6 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
              ٠١
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              صورة جواز السفر
            </h3>
            <p className="text-sm text-gray-500 leading-[1.7] font-medium">
              صورة واضحة وملونة لجواز السفر صالح لمدة 6 أشهر على الأقل من تاريخ
              السفر.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-medium text-xl mx-auto mb-6 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
              ٠٢
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              صورة شخصية
            </h3>
            <p className="text-sm text-gray-500 leading-[1.7] font-medium">
              صورة شخصية حديثة بخلفية بيضاء وبجودة عالية لضمان قبول المعاملة.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-medium text-xl mx-auto mb-6 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
              ٠٣
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              الهوية الوطنية
            </h3>
            <p className="text-sm text-gray-500 leading-[1.7] font-medium">
              صورة الهوية الوطنية (لبعض الجنسيات المحددة) لتدقيق البيانات
              الأمنية.
            </p>
          </div>
        </div>
      </div>
    </ServicePageLayout>
  );
};
