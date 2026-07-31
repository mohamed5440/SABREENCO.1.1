import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Zap, Clock, Award } from "lucide-react";
import { HighlightCurve } from "../ui";

export const Features: React.FC = React.memo(() => {
  const features = [
    {
      icon: <ShieldCheck size={28} strokeWidth={1.5} />,
      title: "أمان تام",
      desc: "حجوزاتك مؤمنة بالكامل ومعلوماتك مشفرة بأحدث التقنيات لضمان خصوصيتك وراحتك طوال فترة رحلتك.",
    },
    {
      icon: <Zap size={28} strokeWidth={1.5} />,
      title: "سرعة الإنجاز",
      desc: "تأشيرتك وحجوزاتك تكتمل في وقت قياسي بفضل فريقنا المتخصص وأنظمتنا المتطورة لخدمتك بشكل أسرع.",
    },
    {
      icon: <Clock size={28} strokeWidth={1.5} />,
      title: "دعم 24/7",
      desc: "فريقنا متاح على مدار الساعة للإجابة على استفساراتك ومساعدتك في أي وقت وأي مكان.",
    },
    {
      icon: <Award size={28} strokeWidth={1.5} />,
      title: "جودة استثنائية",
      desc: "نختار شركاءنا بعناية لضمان تقديم أرقى الخدمات السياحية لك ولعائلتك بأفضل المعايير.",
    },
  ];

  return (
    <section
      id="features-section"
      className="py-10 md:py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12 max-w-2xl mx-auto"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-800 mb-3 sm:mb-4 group-hover:text-primary transition-colors">
            لماذا تختار{" "}
            <HighlightCurve>صابرينكو؟</HighlightCurve>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium px-4">
            نقدم لك تجربة سفر متكاملة وموثوقة تضمن لك الراحة والأمان في كل رحلة،
            مع اهتمام فائق بأدق التفاصيل.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-gray-200 p-5 md:p-6 rounded-xl text-center hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 border border-primary/20">
                {feature.icon}
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
