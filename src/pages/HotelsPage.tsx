import React from "react";
import { Building, DollarSign, ShieldCheck } from "lucide-react";
import { ServicePageLayout } from "../components/layout";

interface HotelsPageProps {
  onNavigate: (page: string, service?: string, context?: any) => void;
}

export const HotelsPage: React.FC<HotelsPageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: <Building size={28} />,
      title: "خيارات متنوعة",
      description:
        "من الفنادق الاقتصادية إلى المنتجعات الفاخرة، نوفر لك آلاف الخيارات التي تناسب ميزانيتك واحتياجاتك.",
    },
    {
      icon: <DollarSign size={28} />,
      title: "أسعار حصرية",
      description:
        "نمتلك تعاقدات مباشرة مع كبرى سلاسل الفنادق لنضمن لك أفضل سعر متاح مع مزايا حصرية لعملائنا.",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "تأكيد فوري",
      description:
        "احصل على تأكيد حجزك فوراً مع إمكانية التعديل أو الإلغاء المرن وفقاً لسياسات الفندق المختارة.",
    },
  ];

  return (
    <ServicePageLayout
      id="hotels-page"
      badge="إقامة فاخرة"
      title="حجز"
      highlight="الفنادق"
      description="نقدم لك أفضل خيارات الإقامة في أرقى الفنادق والمنتجعات حول العالم بأسعار حصرية ومزايا إضافية تضمن لك الراحة والخصوصية."
      features={features}
      ctaTitle="ابحث عن إقامتك المثالية"
      ctaDescription="أخبرنا بوجهتك وميزانيتك، وسيقوم فريقنا بترشيح أفضل الفنادق التي تضمن لك الراحة والرفاهية."
      ctaButtonText="ارسل طلب حجز فندق"
      onCtaClick={() => onNavigate("booking", "hotel")}
    />
  );
};
