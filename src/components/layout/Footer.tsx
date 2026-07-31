import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Banknote,
  Landmark,
  Smartphone,
  Link,
  CreditCard,
  ShieldCheck,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { SocialLinks, WhatsAppIcon, Logo } from "../ui";
import { apiService } from "../../lib/apiService";
import { WHATSAPP_QR_URL } from "../../lib/utils";

interface FooterProps {
  onNavigate: (page: string, service?: string, context?: any) => void;
  socialLinks?: any[];
  contactInfo?: any;
}

interface SubscriptionFormProps {
  className?: string;
  idPrefix?: string;
  subscribeName: string;
  setSubscribeName: (val: string) => void;
  subscribePhone: string;
  setSubscribePhone: (val: string) => void;
  subscribeStatus: "idle" | "loading" | "success" | "error";
  handleSubscribe: (e: React.FormEvent) => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  className = "",
  idPrefix = "desktop",
  subscribeName,
  setSubscribeName,
  subscribePhone,
  setSubscribePhone,
  subscribeStatus,
  handleSubscribe,
}) => (
  <div
    className={`p-5 sm:p-6 bg-primary/5 rounded-xl border border-primary/10 group overflow-hidden relative w-full ${className}`}
  >
    <div className="flex items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="accent-line !h-8 bg-primary"></div>
        <div className="text-right">
          <h4 className="text-base md:text-lg font-medium text-gray-800 leading-tight">
            نشرة العروض
          </h4>
          <p className="text-xs font-medium text-gray-500 leading-none mt-1">
            تنبيهات فورية عبر واتساب
          </p>
        </div>
      </div>
      <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
        <Bell size={22} />
      </div>
    </div>

    <form onSubmit={handleSubscribe} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-subscribe-name`}
          className="text-xs font-medium text-gray-800 pr-1 cursor-pointer"
        >
          الاسم بالكامل
        </label>
        <input
          id={`${idPrefix}-subscribe-name`}
          type="text"
          required

          value={subscribeName}
          onChange={(e) => setSubscribeName(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-medium text-gray-800 focus:border-primary outline-none transition-all placeholder:text-gray-500/30"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-subscribe-phone`}
          className="text-xs font-medium text-gray-800 pr-1 cursor-pointer"
        >
          رقم الواتساب
        </label>
        <div className="relative">
          <input
            id={`${idPrefix}-subscribe-phone`}
            type="tel"
            required

            value={subscribePhone}
            onChange={(e) => setSubscribePhone(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-[84px] sm:pl-28 pr-4 sm:pr-5 py-3 sm:py-3.5 text-sm font-medium text-gray-800 focus:border-primary outline-none transition-all text-right placeholder:text-gray-500/30"
          />
          <button
            type="submit"
            disabled={subscribeStatus === "loading"}
            className={`absolute left-1 top-1 bottom-1 px-2.5 sm:px-5 rounded-xl font-medium text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 ${
              subscribeStatus === "loading"
                ? "bg-muted/20 text-gray-500"
                : "bg-primary text-white hover:bg-primary-hover"
            }`}
          >
            {subscribeStatus === "loading" ? (
              "..."
            ) : (
              <>
                <WhatsAppIcon size={14} />
                <span>اشترك</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>

    {subscribeStatus === "success" && (
      <div className="flex items-center gap-1.5 text-primary font-medium text-xs mt-4 p-3 bg-primary-light rounded-xl border border-primary-soft-border animate-in fade-in slide-in-from-top-1">
        <CheckCircle2 size={14} /> تم الاشتراك بنجاح في التنبيهات
      </div>
    )}
  </div>
);

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  socialLinks = [],
  contactInfo = { phones: [], email: "", address: "", addressUrl: "" },
}) => {
  const [subscribeName, setSubscribeName] = useState("");
  const [subscribePhone, setSubscribePhone] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribePhone || !subscribeName) return;

    setSubscribeStatus("loading");
    try {
      await apiService.subscribeToWhatsApp(subscribePhone, subscribeName);
      setSubscribeStatus("success");
      setSubscribePhone("");
      setSubscribeName("");
      setTimeout(() => setSubscribeStatus("idle"), 5000);
    } catch {
      setSubscribeStatus("error");
    }
  };

  const commonFormProps = {
    subscribeName,
    setSubscribeName,
    subscribePhone,
    setSubscribePhone,
    subscribeStatus,
    handleSubscribe,
  };

  return (
    <footer
      id="main-footer"
      className="bg-white relative pt-12 pb-4 px-4 md:px-6 lg:px-8 border-t border-gray-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Mobile View: Subscription Form First */}
        <div className="sm:hidden mb-12">
          <SubscriptionForm idPrefix="mobile" {...commonFormProps} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-12">
          {/* Row 1, Column 1 (Right): Brand & About */}
          <div className="space-y-6 flex flex-col items-start w-full sm:col-start-1 sm:row-start-1 lg:col-start-1 lg:row-start-1">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                <Logo size={64} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 tracking-normal">
                  صابرينكو
                </h2>
                <p className="text-primary label-caps !text-xs mt-1">
                  للخدمات السياحية
                </p>
              </div>
            </div>

            <p className="text-sm md:text-base text-gray-800 leading-relaxed font-medium">
              شريكك الموثوق في عالم السفر والسياحة. نقدم لك أفضل العروض والوجهات
              السياحية حول العالم بأسعار تنافسية وخدمة عملاء استثنائية.
            </p>

            <SocialLinks
              links={socialLinks}
              linkClassName="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 text-gray-800 shrink-0 group"
              iconSize={18}
              containerClassName="flex items-center gap-3 pt-2"
            />
          </div>

          {/* Row 1, Column 2 (Center): Quick Links */}
          <div className="flex flex-col items-start w-full sm:col-start-2 sm:row-start-1 lg:col-start-2 lg:row-start-1">
            <h3 className="text-gray-800 text-base md:text-lg font-medium mb-6 tracking-normal flex items-center gap-2">
              <div className="accent-line"></div>
              روابط سريعة
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-1 gap-y-3.5 w-full">
              {[
                { id: "home", label: "الرئيسية" },
                { id: "about", label: "من نحن" },
                { id: "destinations", label: "الوجهات" },
                { id: "offers", label: "العروض" },
                { id: "visa", label: "التأشيرات" },
                { id: "contact", label: "تواصل معنا" },
              ].map((item) => (
                <li key={item.id} className="w-full">
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className="flex items-center gap-3 text-gray-800 hover:text-primary transition-all duration-300 font-medium text-sm md:text-base group w-full text-right"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary group-hover:scale-150 transition-all duration-300 shrink-0"></div>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Row 1 + 2, Column 3 (Left): Contact Info + Subscription (Taller) */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-6 lg:gap-8 w-full relative sm:col-span-2 lg:col-span-1 sm:col-start-1 sm:row-start-2 lg:col-start-3 lg:row-start-1 lg:row-span-2">
            <div className="flex flex-col items-start w-full">
              <h3 className="text-gray-800 text-base md:text-lg font-medium mb-6 tracking-normal flex items-center gap-2">
                <div className="accent-line"></div>
                تواصل معنا
              </h3>
              <ul className="space-y-4 w-full">
                <li className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <MapPin size={18} />
                  </div>
                  <div className="pt-1 w-full overflow-hidden">
                    <a
                      href={contactInfo?.addressUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium leading-[1.6] text-gray-800 hover:text-primary transition-colors block"
                    >
                      {contactInfo?.address || "القاهرة، مصر"}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Phone size={18} />
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1 items-start w-full">
                    {(contactInfo?.phones || []).map(
                      (phone: string, idx: number) => (
                        <a
                          key={idx}
                          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                          className="text-sm font-medium text-gray-800 hover:text-primary transition-colors text-right block w-full"
                        >
                          <span dir="ltr" className="inline-block">
                            {phone}
                          </span>
                        </a>
                      ),
                    )}
                  </div>
                </li>

                <li className="flex items-center gap-3 group w-full overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Mail size={18} />
                  </div>
                  <a
                    href={`mailto:${contactInfo?.email || "info@sabreentourism.com"}`}
                    className="text-sm font-medium text-gray-800 hover:text-primary transition-colors truncate block w-full"
                  >
                    {contactInfo?.email || "info@sabreentourism.com"}
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter Subscription (Desktop/Tablet Only) */}
            <SubscriptionForm
              className="hidden sm:block mt-2 lg:mt-6"
              idPrefix="desktop"
              {...commonFormProps}
            />
          </div>

          {/* Row 2, Column 1: Payment Methods */}
          <div className="flex flex-col items-start w-full sm:col-start-1 sm:row-start-3 lg:col-start-1 lg:row-start-2">
            <h3 className="text-gray-800 text-base md:text-lg font-medium mb-6 tracking-normal flex items-center gap-2">
              <div className="accent-line"></div>
              طرق الدفع
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-1 gap-y-3.5 gap-x-4 w-full">
              {[
                { icon: <Banknote size={18} />, label: "الدفع كاش" },
                { icon: <Landmark size={18} />, label: "التحويل البنكي" },
                {
                  icon: <Smartphone size={18} />,
                  label: "إنستاباي (InstaPay)",
                },
                { icon: <Link size={18} />, label: "لينك دفع" },
                { icon: <CreditCard size={18} />, label: "ماكينة فيزا (POS)" },
              ].map((method, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {method.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {method.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Row 2, Column 2: QR Code */}
          <div className="flex flex-col items-start w-full lg:pl-8 sm:col-start-2 sm:row-start-3 lg:col-start-2 lg:row-start-2">
            <h3 className="text-gray-800 text-base md:text-lg font-medium mb-6 tracking-normal flex items-center gap-2">
              <div className="accent-line"></div>
              تابعنا
            </h3>
            <div className="bg-primary/5 rounded-xl p-4 sm:p-5 border border-primary/20 group hover:border-primary/20 transition-all w-full max-w-sm">
              <div className="flex flex-row items-center gap-3 sm:gap-6 justify-between">
                <div className="bg-white p-1.5 sm:p-2 rounded-xl border border-gray-200 shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24">
                    <img
                      src={WHATSAPP_QR_URL}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      width="96"
                      height="96"
                    />
                  </div>
                </div>
                <div className="text-right flex-1 min-w-0 pr-2">
                  <h4 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 mb-1 leading-tight">
                    صفحتنا على فيسبوك
                  </h4>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-500 leading-relaxed">
                    امسح الكود لمتابعة <br />
                    أحدث العروض والرحلات.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 mt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
          <p className="text-sm font-medium text-gray-500 max-w-md text-center sm:text-right">
            © {new Date().getFullYear()} صابرينكو{" "}
            <span className="text-primary font-medium">للخدمات السياحية</span>.
            جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-3 sm:gap-4 bg-white/50 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-gray-200 shrink-0 group cursor-default hover:border-primary/20 transition-colors w-full sm:w-auto justify-center sm:justify-start">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
              <ShieldCheck size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="label-caps !text-[9px] sm:!text-[10px] leading-none text-gray-500">
                مرخص ومعتمد حكومياً
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-800 leading-none">
                رقم السجل التجاري:{" "}
                <span className="text-primary font-medium" dir="ltr">
                  275093
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
