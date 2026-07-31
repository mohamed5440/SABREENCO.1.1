import React from "react";
import {
  Globe,
  Award,
  Briefcase,
  Plane,
  Building,
  Target,
  Eye,
  Zap,
  CheckCircle,
  Map,
  Heart,
  FileCode,
} from "lucide-react";
import { optimizeImageUrl } from "../lib/utils";
import { HighlightCurve } from "../components/ui";

export const AboutPage: React.FC = () => {
  return (
    <section
      id="about-page"
      className="py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 md:space-y-16"
      dir="rtl"
    >
      {/* Header / Intro */}
      <div className="section-header-unified">
        <h1 className="heading-unified">
          من{" "}
          <HighlightCurve >
            نحن
          </HighlightCurve>
        </h1>
        <p className="description-unified">
          نحن رفيقك الموثوق في عالم السفر والخدمات اللوجستية، نسعى دائماً لتقديم
          تجربة فريدة تجمع بين الراحة، الاحترافية، والأسعار المنافسة.
        </p>
      </div>

      {/* Intro Section: Text & Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch max-w-5xl mx-auto">
        <div className="lg:col-span-7 order-2 lg:order-1 bg-primary/5 rounded-xl p-5 sm:p-6 md:p-8 border border-primary/10 flex flex-col justify-center text-right relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary mb-4 border border-gray-200 relative z-10">
            <Building size={22} />
          </div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-800 mb-3 relative z-10 flex items-center gap-2.5">
            <div className="accent-line !h-5 !w-1"></div>
            نبذة عـنّا
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-[1.7] font-medium mb-6 relative z-10">
            شركة صابرينكو للخدمات السياحية هي شريكك الموثوق في عالم السفر
            والأعمال، حيث نقدم حلولاً سياحية متكاملة وفق أعلى معايير الجودة
            والاحترافية، لنمنح عملاءنا تجربة سلسة ومتميزة في كل خطوة.
          </p>
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm self-start px-4 py-2.5 rounded-xl border border-primary/10 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileCode size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
                التوثيق الرسمي
              </span>
              <span className="text-xs font-medium text-gray-800">
                رقم السجل التجاري: 275093
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2 w-full overflow-hidden rounded-xl aspect-[5/4] lg:aspect-auto lg:h-full relative group min-h-[250px] lg:min-h-[320px]">
          <img
            loading="lazy"
            decoding="async"
            src={optimizeImageUrl(
              "https://i.postimg.cc/FFTr4Xbz/file-00000000f92072468bbb391e4e39d0b0.png",
              800,
            )}
            alt="عن صابرينكو"
            className="w-full h-full object-cover rounded-xl transition-all duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
            width="800"
            height="600"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none rounded-xl"></div>
        </div>
      </div>

      {/* Journey Section */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">
            مسيرتنا
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
            محطات رئيسية ساهمت في صياغة هويتنا وبناء جسور الثقة مع عملائنا.
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 border border-gray-200 space-y-6 text-right">
          <div className="relative pr-6 sm:pr-8 border-r border-primary/30 pb-1">
            <div className="absolute top-1.5 -right-[5px] w-2.5 h-2.5 rounded-full bg-primary border-2 border-white transition-transform hover:scale-125"></div>
            <h3 className="text-xs sm:text-sm font-bold text-primary mb-1 tracking-wide">
              19 مارس 2025
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-[1.7] font-medium">
              انطلقت رحلتنا في دولة الإمارات العربية المتحدة تحت اسم شركة صابرين
              للسياحة، واضعين رؤية واضحة تتمثل في تقديم خدمات سياحية متطور تلبي
              احتياجات الأفراد ورواد الأعمال على حد سواء.
            </p>
          </div>

          <div className="relative pr-6 sm:pr-8 border-r border-primary/30">
            <div className="absolute top-1.5 -right-[5px] w-2.5 h-2.5 rounded-full bg-primary border-2 border-white transition-transform hover:scale-125"></div>
            <h3 className="text-xs sm:text-sm font-bold text-primary mb-1 tracking-wide">
              10 نوفمبر 2025
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-[1.7] font-medium">
              وانطلاقًا من حرصنا على التوسع وخدمة عملائنا بشكل أفضل، وعلى رأسهم
              العميل المصري الذي نعتز بثقته، تم تأسيس شركة صابرينكو للخدمات
              السياحية، لتكون امتدادًا قويًا لأعمالنا، ومنصة متخصصة لخدمة السوق
              المصري بمستوى عالٍ من المصداقية والاحترافية.
            </p>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-5xl mx-auto">
        <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl border border-gray-200 hover:border-primary/20 transition-all duration-300 group relative overflow-hidden text-right">
          <div className="absolute top-0 left-0 w-20 h-20 bg-primary/5 rounded-br-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-4 border border-primary/20">
            <Eye size={22} />
          </div>
          <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-2.5">
            رؤيتنا
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-[1.7] font-medium">
            أن نكون من الشركات الرائدة في مجال السياحة والخدمات الاستثمارية في
            المنطقة، من خلال تقديم حلول مبتكرة وتجربة عملاء استثنائية تفوق
            توقعاتهم.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl border border-gray-200 hover:border-primary/20 transition-all duration-300 group relative overflow-hidden text-right">
          <div className="absolute top-0 left-0 w-20 h-20 bg-primary-light rounded-br-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-4 border border-primary/20">
            <Target size={22} />
          </div>
          <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-2.5">
            رسالتنا
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-[1.7] font-medium">
            تقديم خدمات سياحية واستثمارية موثوقة، سريعة، وذات جودة عالية، تساهم
            في تسهيل السفر وتنمية الأعمال لعملائنا وتذليل كافة العقبات أمامهم.
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">
            خدماتنا
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
            نقدم في صابرينكو باقة متكاملة من الخدمات المتخصصة والمصممة لتلبية
            احتياجاتكم:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {[
            {
              icon: <Map size={20} />,
              text: "إصدار تأشيرات السياحة إلى دولة الإمارات العربية المتحدة",
            },
            {
              icon: <Globe size={20} />,
              text: "إصدار التأشيرات السياحية لمختلف الوجهات العالمية",
            },
            {
              icon: <Plane size={20} />,
              text: "حجز تذاكر الطيران بأفضل الأسعار المتاحة",
            },
            {
              icon: <Building size={20} />,
              text: "حجز الفنادق وفق أعلى معايير الراحة والجودة",
            },
            {
              icon: <Briefcase size={20} />,
              text: "خدمات متكاملة وحلول لوجستية لرجال الأعمال",
            },
            {
              icon: <Award size={20} />,
              text: "تأسيس الشركات في دولة الإمارات وتقديم الاستشارات اللازمة",
            },
          ].map((service, index) => (
            <div
              key={index}
              className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 flex items-start gap-3 hover:border-primary/20 transition-all duration-300 group text-right hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shrink-0 border border-gray-200 group-hover:bg-primary/5 transition-colors">
                {service.icon}
              </div>
              <p className="text-xs sm:text-sm text-gray-800 font-medium leading-[1.6] pt-0.5">
                {service.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="bg-white rounded-xl p-5 sm:p-6 lg:p-8 border border-gray-200 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl font-medium text-gray-800 mb-2 flex items-center justify-center gap-2.5">
            <div className="accent-line !h-5 !w-1"></div>
            قيمنا
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            المبادئ والأسس الأخلاقية والمهنية التي نلتزم بها in كافة أعمالنا
            اليومية.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 justify-center">
          {[
            { icon: <Eye size={22} />, text: "الشفافية" },
            { icon: <Award size={22} />, text: "الاحترافية" },
            { icon: <Zap size={22} />, text: "السرعة في التنفيذ" },
            { icon: <CheckCircle size={22} />, text: "الدقة والالتزام" },
            { icon: <Heart size={22} />, text: "رضا العميل أولاً" },
          ].map((value, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl border border-gray-200 hover:border-primary/20 transition-all duration-300 text-center flex flex-col items-center justify-center gap-3 group hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform duration-300 border border-primary/5">
                {value.icon}
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-800">
                {value.text}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Conclusion */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <p className="text-xs sm:text-sm text-gray-500 leading-[1.7] font-medium px-4">
          نؤمن بأن نجاحنا يبدأ من ثقة عملائنا، لذلك نحرص دائمًا على تقديم تجربة
          مميزة تعتمد على الجودة العالية وخدمة عملاء احترافية، مدعومة بفريق عمل
          ذو خبرة متنامية في السوق السياحي والاستثماري.
        </p>
        <div className="inline-block bg-primary-light/40 border border-primary/20 rounded-xl p-4 sm:p-5 max-w-[90%] sm:max-w-full">
          <p className="text-sm sm:text-base md:text-lg font-medium text-primary leading-relaxed">
            صابرينكو... حيث تبدأ رحلتك بثقة، وتنمو أعمالك باحترافية.
          </p>
        </div>
      </div>
    </section>
  );
};
