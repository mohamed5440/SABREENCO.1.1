import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Plane,
  Building,
  FileText,
  Globe,
  ShieldCheck,
  Briefcase,
  Check,
} from "lucide-react";

interface HeroProps {
  onNavigate: (page: string, service?: string, context?: any) => void;
}

export const Hero: React.FC<HeroProps> = React.memo(({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("flights");

  const tabs = [
    { id: "flights", label: "طيران", icon: Plane },
    { id: "hotels", label: "فنادق", icon: Building },
    { id: "uae-visa", label: "تأشيرة سياحة الإمارات", icon: FileText },
    { id: "other-visa", label: "تأشيرة سياحة أخرى", icon: Globe },
    { id: "insurance", label: "تأمين سفر", icon: ShieldCheck },
    { id: "companies", label: "تأسيس شركات", icon: Briefcase },
  ];

  const content = {
    flights: {
      type: "flight",
      title: "أفضل عروض الطيران",
      desc: "احجز رحلتك القادمة بأفضل الأسعار مع كبرى شركات الطيران العالمية والمحلية.",
      features: ["امكانية التعديل", "ادارة الحجز و Check in", "دعم 24/7"],
      btnText: "ارسال طلب حجز",
    },
    hotels: {
      type: "hotel",
      title: "فنادق ومنتجعات فاخرة",
      desc: "استمتع بإقامة لا تنسى في أفضل الفنادق حول العالم مع خيارات تناسب جميع الميزانيات.",
      features: ["الغاء مجاني", "وجبات", "افضل الاختيارات"],
      btnText: "ارسال طلب حجز",
    },
    "uae-visa": {
      type: "visa_uae",
      title: "تأشيرة سياحة الإمارات",
      desc: "استخرج تأشيرة الإمارات بكل سهولة وسرعة مع فريقنا المتخصص.",
      features: ["موافقة سريعة", "أقل المتطلبات", "دعم فني"],
      btnText: "ارسال طلب حجز",
    },
    "other-visa": {
      type: "visa_other",
      title: "تأشيرات سياحية أخرى",
      desc: "نقدم خدمات استخراج التأشيرات لمختلف دول العالم بمهرافية عالية.",
      features: ["تغطية عالمية", "استشارات مجانية", "متابعة الطلب"],
      btnText: "ارسال طلب حجز",
    },
    insurance: {
      type: "travel_insurance",
      title: "تأمين سفر متكامل",
      desc: "احمِ نفسك وعائلتك أثناء السفر مع أفضل برامج التأمين الطبي والحوادث.",
      features: ["تغطية طبية واسعة", "تعويض فوري", "مقبول عالمياً"],
      btnText: "ارسال طلب حجز",
    },
    companies: {
      type: "company_setup",
      title: "تأسيس شركات دولية",
      desc: "نساعدك في تأسيس عملك الخاص وتوسيع نشاطك التجاري في أفضل البيئات الاستثمارية.",
      features: ["استشارات قانونية", "سرعة في التنفيذ", "دعم إداري"],
      btnText: "ارسال طلب حجز",
    },
  };

  const active = content[activeTab as keyof typeof content];

  return (
    <section
      id="hero-section"
      className="relative pt-6 pb-8 md:pt-16 md:pb-20 lg:pt-24 lg:pb-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden w-full bg-white"
    >
      {/* Booking Widget */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full max-w-[95vw] md:max-w-2xl lg:max-w-4xl bg-white rounded-xl border border-gray-200 p-4 md:p-6 relative z-10 mx-auto"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 mb-6 md:mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 md:py-4 px-1 rounded-xl md:rounded-xl text-2xs sm:text-xs font-medium transition-all duration-300 w-full text-center border-2 active:scale-95 ${
                activeTab === tab.id
                  ? "bg-primary-light/30 border-primary text-primary"
                  : "bg-white/50 border-transparent text-gray-500 hover:text-gray-800 hover:bg-white hover:border-gray-100"
              }`}
            >
              <tab.icon
                size={18}
                className="mb-0.5 shrink-0 md:w-5 md:h-5"
                strokeWidth={activeTab === tab.id ? 2.5 : 2}
              />
              <span className="line-clamp-2 lg:line-clamp-none px-0.5 leading-tight break-words">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center text-center px-2 md:px-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-normal text-gray-800 mb-3 md:mb-4 leading-tight">
            {active.title}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-800 leading-[1.6] md:leading-[1.8] font-medium max-w-lg mx-auto mb-5 md:mb-6">
            {active.desc}
          </p>

          <button
            onClick={() => onNavigate("booking", active.type)}
            className="w-full sm:w-[80%] md:w-[60%] px-6 md:px-8 py-3.5 md:py-4 bg-primary text-white rounded-xl font-medium text-sm md:text-base flex items-center justify-center hover:bg-primary-hover transition-all duration-300 active:scale-95 select-none mb-6"
          >
            {active.btnText}
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full flex-wrap">
            {active.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 text-xs md:text-sm font-medium text-gray-800 bg-white px-4 md:px-5 py-2.5 rounded-xl border border-gray-200 w-full sm:w-auto sm:min-w-[170px] md:min-w-[210px]"
              >
                <span className="truncate">{feature}</span>
                <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center text-primary shrink-0">
                  <Check size={11} className="w-3 h-3" strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
});
