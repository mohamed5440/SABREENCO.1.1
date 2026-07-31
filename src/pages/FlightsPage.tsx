import React from "react";
import { Plane, ShieldCheck, Clock } from "lucide-react";
import { ServicePageLayout } from "../components/layout";

interface FlightsPageProps {
  onNavigate: (page: string, service?: string, context?: any) => void;
}

export const FlightsPage: React.FC<FlightsPageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: <Plane size={28} />,
      title: "أفضل الأسعار",
      description:
        "نحن نقارن بين مئات شركات الطيران لنضمن لك الحصول على أقل سعر متاح لرحلتك القادمة.",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "حجز آمن ومضمون",
      description:
        "جميع عمليات الحجز لدينا تتم عبر أنظمة عالمية مشفرة لضمان أمان بياناتك وخصوصيتك.",
    },
    {
      icon: <Clock size={28} />,
      title: "دعم فني متواصل",
      description:
        "فريقنا متاح على مدار الساعة لمساعدتك في أي استفسار أو تعديل على حجزك بكل سهولة.",
    },
  ];

  return (
    <ServicePageLayout
      id="flights-page"
      badge="رحلات آمنة"
      title="حجز"
      highlight="طيران"
      description="نقدم لك أفضل عروض الطيران لجميع الوجهات العالمية والمحلية مع كبرى شركات الطيران العالمية وبأسعار تنافسية لا تقبل المنافسة."
      features={features}
      ctaTitle="هل أنت جاهز لرحلتك القادمة؟"
      ctaDescription="تواصل معنا الآن وسنقوم بالبحث عن أفضل الرحلات والمواعيد التي تناسبك بأفضل الأسعار المتاحة."
      ctaButtonText="ارسل طلب حجز طيران"
      onCtaClick={() => onNavigate("booking", "flight")}
    />
  );
};
