import React from "react";
import { motion } from "motion/react";
import { Mail, Phone, Globe } from "lucide-react";
import { WhatsAppIcon, HighlightCurve } from "../components/ui";
import { optimizeImageUrl, WHATSAPP_QR_URL } from "../lib/utils";

interface ContactPageProps {
  contactInfo?: {
    phones: string[];
    email: string;
    address: string;
    addressUrl: string;
  };
  socialLinks?: { platform: string; url: string }[];
}

export const ContactPage: React.FC<ContactPageProps> = ({
  contactInfo,
  socialLinks,
}) => {
  const primaryPhone = contactInfo?.phones?.[0] || "+201553004593";
  const secondaryPhone = contactInfo?.phones?.[1] || "+201103103362";
  const tertiaryPhone = contactInfo?.phones?.[2] || "+201154162244";

  const displayPhones =
    contactInfo?.phones && contactInfo.phones.length > 0
      ? contactInfo.phones
      : [primaryPhone, secondaryPhone, tertiaryPhone];

  const contactEmail = contactInfo?.email || "reservations@sabreenco.com";
  const whatsappLink =
    socialLinks?.find(
      (s) => s.platform === "whatsapp" || s.platform === "واتساب",
    )?.url || `https://wa.me/${primaryPhone.replace(/\D/g, "")}`;

  return (
    <section
      id="contact-page"
      className="py-10 md:py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
      dir="rtl"
    >
      <div className="section-header-unified">
        <h1 className="heading-unified">
          نسعد دائماً بـ{" "}
          <HighlightCurve>تواصلكم معنا</HighlightCurve>
        </h1>
        <p className="description-unified">
          نحن هنا لمساعدتكم في كل ما يخص رحلاتكم. فريقنا جاهز للرد على جميع
          استفساراتكم وتقديم الدعم اللازم بكل احترافية على مدار الساعة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Contact Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 lg:p-8 border border-gray-200 flex flex-col justify-between"
        >
          <div className="space-y-6 md:space-y-8">
            {/* Address Section */}
            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <Globe size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="label-caps mb-2 text-right">العنوان</h3>
                <a
                  href={contactInfo?.addressUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-primary transition-colors text-sm sm:text-base font-medium leading-relaxed block w-full text-right tracking-wide"
                >
                  {contactInfo?.address ||
                    "صابرينكو للخدمات السياحية - روكسي - الدور السادس - مصر الجديده - القاهرة"}
                </a>
              </div>
            </div>

            {/* Phones Section */}
            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <Phone size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-col items-start w-full pt-1">
                <h3 className="label-caps mb-2 text-right">أرقام الهاتف</h3>
                <div className="flex flex-col gap-1.5 items-start w-full">
                  {displayPhones.map((phone, idx) => (
                    <a
                      key={idx}
                      href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                      className="text-gray-800 hover:text-primary transition-colors text-sm sm:text-base font-medium text-right block tracking-wide w-full"
                    >
                      <span dir="ltr" className="inline-block">
                        {phone}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Section */}
            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <Mail size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="label-caps mb-2 text-right">
                  البريد الإلكتروني
                </h3>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-gray-800 hover:text-primary transition-colors text-sm sm:text-base font-medium break-words w-full truncate block text-right tracking-wide"
                >
                  {contactEmail}
                </a>
              </div>
            </div>

            {/* Facebook QR Code */}
            <div className="pt-6 md:pt-8 border-t border-gray-200 flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-2 rounded-xl border border-gray-200 shrink-0 group hover:border-primary/20 transition-all">
                <img
                  src={optimizeImageUrl(
                    WHATSAPP_QR_URL,
                    200,
                  )}
                  alt="Facebook QR Code"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  width="96"
                  height="96"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-800 text-sm sm:text-base font-medium mb-1 tracking-wide">
                  امسح كود فيسبوك
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  للوصول السريع لصفحتنا والتواصل
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Button */}
          <div className="mt-8 md:mt-10">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-primary-unified"
            >
              <WhatsAppIcon size={20} />
              تحدث معنا عبر واتساب
            </a>
          </div>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative min-h-[350px] lg:h-auto rounded-xl border border-gray-200 overflow-hidden bg-white"
        >
          <iframe
            src={
              contactInfo?.addressUrl ||
              "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.035409391062!2d31.318522524987564!3d30.09317221626129!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x245c4f197382d62b%3A0xef6ed84fa3f29564!2z2LXYp9io2LHZitmG2YPZiCDZhNmE2K7Yr9mF2KfYqiDYp9mE2LPZitin2K3Zitip!5e0!3m2!1sar!2seg!4v1782998635960!5m2!1sar!2seg"
            }
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="موقع الشركة"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
};
