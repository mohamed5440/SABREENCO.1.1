import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Plane,
  Building,
  ShieldCheck,
  Globe,
  Shield,
  User,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  CheckCircle2,
  Camera,
  FileCode,
} from "lucide-react";
import { apiService } from "../lib/apiService";
import { securityUtils, compressImage } from "../lib/utils";
import {
  FlightForm,
  HotelForm,
  VisaForm,
  InsuranceForm,
  CompanyForm,
  FileAttachmentInput,
} from "../components/booking";
import { HighlightCurve } from "../components/ui";

interface BookingPageProps {
  initialServiceType?: string;
  context?: any;
  contactInfo?: any;
  socialLinks?: any;
  showAppToast: (message: string, type: "success" | "error") => void;
  onNavigate: (page: string, service?: string, context?: any) => void;
  onAddBooking: (booking: any) => void;
  currentUser?: any;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  initialServiceType = "flight",
  context,
  contactInfo,
  showAppToast,
  onNavigate,
  onAddBooking,
  currentUser,
}) => {
  const [serviceType, setServiceType] = useState(initialServiceType);
  const [whatsappFallbackUrl, setWhatsappFallbackUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setTimeout(() => setServiceType(initialServiceType), 0);
  }, [initialServiceType]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    website: "", // Honeypot field
    preferredContact: "whatsapp",
    preferredContactTime: "any",
    passportNumber: "",
    passportImage: null as string | null,
    personalPhoto: null as string | null,
    documents: null as string | null,
    notes: context?.offerName
      ? `أرغب بحجز العرض: ${context.offerName}`
      : context?.visaName
        ? `أرغب بطلب تأشيرة: ${context.visaName}`
        : "",
    // Flight fields
    flightFrom: "",
    flightTo: context?.destination || "",
    flightDate: "",
    flightReturnDate: "",
    flightAdults: "1",
    flightChildren: "0",
    flightInfants: "0",
    flightType: "round_trip",
    flightClass: "economy",
    flightPreferredTime: "any",
    flightDirect: "any",
    // Hotel fields
    hotelCity: context?.destination || "",
    hotelCheckIn: "",
    hotelCheckOut: "",
    hotelAdults: "1",
    hotelChildren: "0",
    hotelRooms: "1",
    hotelMealPlan: "breakfast",
    hotelRoomType: "double",
    // Visa fields
    visaNationality: "",
    visaDestination: context?.destination || "",
    visaType: "tourist",
    visaDate: "",
    visaDuration: "30",
    visaPassportExpiry: "",
    // Travel Insurance fields
    insuranceDestination: context?.destination || "",
    insuranceStartDate: "",
    insuranceEndDate: "",
    insuranceDOB: "",
    // Company Setup fields
    companyCountry: context?.destination || "",
    companyType: "llc",
    companyPartners: "1",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "passportImage" | "documents" | "personalPhoto",
    maxSizeMB: number,
    maxWidth = 1200,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        showAppToast(
          `حجم الملف كبير جداً. الحد الأقصى هو ${maxSizeMB} ميجابايت.`,
          "error",
        );
        return;
      }
      try {
        const compressedBase64 = await compressImage(file, maxWidth);
        setFormData((prev) => ({
          ...prev,
          [field]: compressedBase64,
        }));
      } catch (error) {
        console.error("Error compressing image:", error);
        showAppToast("حدث خطأ أثناء معالجة الصورة", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (formData.website) {
      console.warn("Bot submission detected");
      setIsSuccess(true); // Fake success to fool bots
      return;
    }

    setIsSubmitting(true);

    try {
      let details = "";
      if (serviceType === "flight") {
        const typeMap: any = {
          one_way: "ذهاب فقط",
          round_trip: "ذهاب وعودة",
          multi: "وجهات متعددة",
        };
        const classMap: any = {
          economy: "اقتصادية",
          business: "رجال أعمال",
          first: "درجة أولى",
        };
        const timeMap: any = {
          any: "أي وقت",
          morning: "صباحاً",
          afternoon: "ظهراً",
          evening: "مساءً",
        };
        const directMap: any = { any: "أي رحلة", direct: "مباشرة فقط" };
        details = `نوع الرحلة: ${typeMap[formData.flightType]}\nالدرجة: ${classMap[formData.flightClass]}\nمن: ${formData.flightFrom}\nإلى: ${formData.flightTo}\nتاريخ الذهاب: ${formData.flightDate}${formData.flightType === "round_trip" ? `\nتاريخ العودة: ${formData.flightReturnDate}` : ""}\nالبالغين: ${formData.flightAdults}\nالأطفال: ${formData.flightChildren}\nالرضع: ${formData.flightInfants}\nالوقت المفضل: ${timeMap[formData.flightPreferredTime]}\nتفضيل الرحلة: ${directMap[formData.flightDirect]}`;
      } else if (serviceType === "hotel") {
        const mealMap: any = {
          room_only: "بدون وجبات",
          breakfast: "إفطار",
          half_board: "إقامة مع وجبتين",
          full_board: "إقامة كاملة",
          all_inclusive: "شامل كلياً",
        };
        const roomMap: any = {
          single: "غرفة مفردة",
          double: "غرفة مزدوجة",
          triple: "غرفة ثلاثية",
          suite: "جناح",
        };
        details = `المدينة أو الفندق المطلوب: ${formData.hotelCity || "غير محدد"}\nنوع الغرفة: ${roomMap[formData.hotelRoomType]}\nنظام الوجبات: ${mealMap[formData.hotelMealPlan]}\nوصول: ${formData.hotelCheckIn}\nمغادرة: ${formData.hotelCheckOut}\nالغرف: ${formData.hotelRooms}\nالبالغين: ${formData.hotelAdults}\nالأطفال: ${formData.hotelChildren}`;
      } else if (
        serviceType === "visa" ||
        serviceType === "visa_uae" ||
        serviceType === "visa_other"
      ) {
        const visaTypeMap: any = {
          tourist: "سياحية",
          business: "عمل",
          study: "دراسة",
          medical: "علاج",
        };
        details = `الجنسية: ${formData.visaNationality}\nالوجهة: ${formData.visaDestination}\nالنوع: ${visaTypeMap[formData.visaType]}\nالمدة: ${formData.visaDuration} يوم\nالتاريخ المتوقع: ${formData.visaDate}\nانتهاء الجواز: ${formData.visaPassportExpiry}\nصورة الجواز: ${formData.passportImage ? "مرفقة" : "غير مرفقة"}`;
      } else if (serviceType === "travel_insurance") {
        details = `الوجهة: ${formData.insuranceDestination}\nتاريخ البداية: ${formData.insuranceStartDate}\nتاريخ النهاية: ${formData.insuranceEndDate}\nتاريخ الميلاد: ${formData.insuranceDOB}`;
      } else if (serviceType === "company_setup") {
        const companyTypeMap: any = {
          llc: "ذات مسؤولية محدودة (LLC)",
          freezone: "منطقة حرة",
          offshore: "أوفشور",
        };
        details = `الدولة - المدينة: ${formData.companyCountry}\nنوع الشركة: ${companyTypeMap[formData.companyType]}\nعدد الشركاء: ${formData.companyPartners}`;
      }

      const contactMap: any = {
        whatsapp: "واتساب",
        call: "اتصال هاتفي",
        email: "بريد إلكتروني",
      };
      const contactTimeMap: any = {
        any: "أي وقت",
        morning: "صباحاً",
        afternoon: "ظهراً",
        evening: "مساءً",
      };
      const serviceNameMap: any = {
        flight: "طيران",
        hotel: "فنادق",
        visa: "تأشيرات",
        visa_uae: "تأشيرة سياحة الإمارات",
        visa_other: "تأشيرة سياحة أخرى",
        travel_insurance: "تأمين سفر",
        company_setup: "تأسيس شركات",
      };
      const message = `*طلب حجز جديد*\n\n*الخدمة:* ${serviceNameMap[serviceType] || serviceType}\n*الاسم:* ${formData.name}\n*رقم الجواز:* ${formData.passportNumber}\n*الهاتف:* ${formData.phone}\n*الايميل:* ${formData.email || "غير محدد"}\n*وسيلة التواصل:* ${contactMap[formData.preferredContact]}\n*وقت التواصل المفضل:* ${contactTimeMap[formData.preferredContactTime]}\n*مرفقات:* ${formData.passportImage ? "صورة الجواز" : ""} ${formData.personalPhoto ? "الصورة الشخصية" : ""} ${formData.documents ? "مستندات إضافية" : ""}\n\n*التفاصيل:*\n${details}\n\n*ملاحظات:* ${formData.notes || "لا يوجد"}`;

      let whatsappNumber = "201553004593";
      if (contactInfo?.phones?.[0]) {
        const cleaned = contactInfo.phones[0].replace(/[^\d+]/g, "").replace(/^\+/, "");
        if (cleaned) whatsappNumber = cleaned;
      }
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      // Open immediately to bypass popup blockers, wrapped in try-catch for iframe sandbox protection
      let whatsappWindow: Window | null = null;
      try {
        whatsappWindow = window.open("about:blank", "_blank");
      } catch (e) {
        console.warn("window.open blocked or restricted by iframe sandbox settings:", e);
      }

      const bookingData = {
        userId: currentUser?.id || null,
        name: securityUtils.sanitizeString(formData.name),
        phone: securityUtils.sanitizeString(formData.phone),
        email: formData.email
          ? securityUtils.sanitizeString(formData.email)
          : "",
        passportNumber: securityUtils.sanitizeString(formData.passportNumber),
        preferredContact: contactMap[formData.preferredContact],
        preferredContactTime: contactTimeMap[formData.preferredContactTime],
        service: serviceNameMap[serviceType] || serviceType,
        serviceType: serviceType,
        date: new Date().toISOString().split("T")[0],
        status: "pending",
        details: securityUtils.sanitizeString(
          formData.notes ? `${details}\n\nملاحظات: ${formData.notes}` : details,
        ),
        passportImage: formData.passportImage,
        personalPhoto: formData.personalPhoto,
        documents: formData.documents ? [formData.documents] : [],
      };

      // Set fallback and success state early to improve perceived speed
      setWhatsappFallbackUrl(whatsappUrl);

      // Update the opened window with the whatsapp URL
      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }

      // Show success screen immediately
      setIsSuccess(true);
      showAppToast("تم إرسال طلبك بنجاح! سيتم تحويلك إلى واتساب.", "success");

      // Save to database in background
      try {
        const savedBooking = await apiService.addBooking(bookingData);
        onAddBooking(savedBooking);
      } catch (saveError: any) {
        console.error("Background save error:", saveError);
        // Inform user that even though WhatsApp opened, the database save failed
        showAppToast(
          `تنبيه: تم فتح واتساب ولكن فشل حفظ البيانات في النظام (${saveError.message})`,
          "error",
        );
      }
    } catch (error: any) {
      console.error("Booking submission error:", error);
      showAppToast(
        `خطأ في الإرسال: ${error.message || "يرجى المحاولة مرة أخرى."}`,
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-12 md:py-20 px-4 max-w-2xl mx-auto min-h-[70vh] flex flex-col justify-center"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center relative overflow-hidden">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 100 }}
            className="w-20 h-20 bg-primary/5 text-primary rounded-xl flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-medium text-gray-800 mb-4">
            تم استلام طلبك بنجاح
          </h2>

          <p className="text-gray-500 text-base md:text-lg mb-10 leading-relaxed max-w-md mx-auto font-medium">
            شكراً لثقتك بنا. طلبك الآن قيد المعالجة، وسيقوم أحد مسؤولي الحجوزات
            بالتواصل معك عبر واتساب لمتابعة الإجراءات.
          </p>

          <div className="space-y-4 max-w-sm mx-auto">
            {whatsappFallbackUrl && (
              <a
                href={whatsappFallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 h-14 bg-primary text-white rounded-xl font-medium text-base hover:bg-primary-hover transition-all active:scale-95"
              >
                المتابعة عبر واتساب
              </a>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.location.reload()}
                className="h-14 bg-white text-gray-800 border border-gray-200 hover:border-primary/40 hover:text-primary rounded-xl font-medium text-sm transition-all"
              >
                حجز جديد
              </button>
              <button
                onClick={() => onNavigate("home")}
                className="h-14 bg-white text-gray-800 border border-gray-200 hover:border-primary/40 hover:text-primary rounded-xl font-medium text-sm transition-all"
              >
                الرئيسية
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-10 md:py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="relative mb-8 md:mb-12 flex flex-col items-center">
        <div className="w-full flex justify-start mb-6 md:absolute md:top-2 md:right-0 md:mb-0">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-1.5 md:gap-2 text-gray-500 hover:text-primary transition-all font-medium text-xs md:text-sm group"
          >
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
            العودة للرئيسية
          </button>
        </div>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-3 sm:mb-4 leading-tight max-w-[95%] tracking-tight mx-auto">
            طلب{" "}
            <HighlightCurve>حجز جديد</HighlightCurve>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            يرجى ملء البيانات التالية وسنقوم بالتواصل معك في أقرب وقت لإتمام
            حجزك بأفضل الخيارات المتاحة.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 relative overflow-hidden">
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Honeypot field - hidden from users */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Service Selection */}
            <div className="space-y-6">
              <h3 className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-3">
                <div className="accent-line"></div>
                اختر نوع الخدمة
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
                {[
                  { id: "flight", label: "طيران", icon: Plane },
                  { id: "hotel", label: "فنادق", icon: Building },
                  {
                    id: "visa_uae",
                    label: "تأشيرة سياحة الإمارات",
                    icon: ShieldCheck,
                  },
                  { id: "visa_other", label: "تأشيرة سياحة أخرى", icon: Globe },
                  { id: "travel_insurance", label: "تأمين سفر", icon: Shield },
                  { id: "company_setup", label: "تأسيس شركات", icon: Building },
                ].map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setServiceType(service.id)}
                    className={`group h-full py-3 md:py-5 px-1 md:px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-3 transition-all duration-300 border-2 active:scale-95 select-none ${
                      serviceType === service.id
                        ? "bg-primary-light/30 border-primary text-primary"
                        : "bg-white border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all ${
                        serviceType === service.id
                          ? "bg-primary text-white"
                          : "bg-white text-gray-500 group-hover:text-gray-800"
                      }`}
                    >
                      <service.icon
                        size={16}
                        strokeWidth={2.5}
                        className="md:w-5 md:h-5"
                      />
                    </div>
                    <span className="text-[10px] md:text-sm font-medium text-center px-0.5 leading-tight">
                      {service.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-6">
              <h3 className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-3">
                <div className="accent-line"></div>
                البيانات الشخصية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <label className="block label-caps mb-2 pr-1">
                    الاسم الكامل
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="name"

                      value={formData.name || ""}
                      onChange={handleChange}
                      className="w-full h-12 bg-white border border-gray-200 rounded-xl pr-11 pl-4 text-sm md:text-base text-gray-800 font-medium focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block label-caps mb-2 pr-1">
                    رقم الهاتف
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                      <Phone size={18} />
                    </div>
                    <input
                      required
                      type="tel"
                      name="phone"

                      value={formData.phone || ""}
                      onChange={handleChange}
                      className="w-full h-12 bg-white border border-gray-200 rounded-xl pr-11 pl-4 text-sm md:text-base text-gray-800 font-medium focus:outline-none focus:border-primary transition-all text-right animate-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block label-caps mb-2 pr-1">
                    البريد الإلكتروني
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"

                      value={formData.email || ""}
                      onChange={handleChange}
                      className="w-full h-12 bg-white border border-gray-200 rounded-xl pr-11 pl-4 text-sm md:text-base text-gray-800 font-medium focus:outline-none focus:border-primary transition-all text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block label-caps mb-2 pr-1">
                    رقم الجواز
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                      <FileText size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="passportNumber"

                      value={formData.passportNumber || ""}
                      onChange={handleChange}
                      className="w-full h-12 bg-white border border-gray-200 rounded-xl pr-11 pl-4 text-sm md:text-base text-gray-800 font-medium focus:outline-none focus:border-primary transition-all text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block label-caps mb-2 pr-1">
                    طريقة التواصل المفضلة
                  </label>
                  <select
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleChange}
                    className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm md:text-base font-medium focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="whatsapp">واتساب</option>
                    <option value="call">اتصال هاتفي</option>
                    <option value="email">بريد إلكتروني</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block label-caps mb-2 pr-1">
                    وقت التواصل المفضل
                  </label>
                  <select
                    name="preferredContactTime"
                    value={formData.preferredContactTime}
                    onChange={handleChange}
                    className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm md:text-base font-medium focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="any">أي وقت</option>
                    <option value="morning">صباحاً</option>
                    <option value="afternoon">ظهراً</option>
                    <option value="evening">مساءً</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-6">
              <h3 className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-3">
                <div className="accent-line"></div>
                تفاصيل الحجز
              </h3>

              {serviceType === "flight" && (
                <FlightForm
                  formData={formData}
                  onChange={handleChange}
                  today={today}
                />
              )}

              {serviceType === "hotel" && (
                <HotelForm
                  formData={formData}
                  onChange={handleChange}
                  today={today}
                />
              )}

              {(serviceType === "visa" ||
                serviceType === "visa_uae" ||
                serviceType === "visa_other") && (
                <VisaForm
                  formData={formData}
                  onChange={handleChange}
                  today={today}
                />
              )}

              {serviceType === "travel_insurance" && (
                <InsuranceForm
                  formData={formData}
                  onChange={handleChange}
                  today={today}
                />
              )}

              {serviceType === "company_setup" && (
                <CompanyForm formData={formData} onChange={handleChange} />
              )}

              {/* Attachments Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <h3 className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-3">
                  <div className="accent-line"></div>
                  المرفقات (صور أو مستندات)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FileAttachmentInput
                    label="صورة الجواز"
                    hasFile={!!formData.passportImage}
                    icon={Camera}
                    onChange={(e) => handleFileUpload(e, "passportImage", 5, 1200)}
                    uploadText="رفع صورة"
                  />
                  <FileAttachmentInput
                    label="صورة شخصية"
                    hasFile={!!formData.personalPhoto}
                    icon={User}
                    onChange={(e) => handleFileUpload(e, "personalPhoto", 5, 800)}
                    uploadText="رفع صورة"
                  />
                  <FileAttachmentInput
                    label="مستندات إضافية"
                    hasFile={!!formData.documents}
                    icon={FileCode}
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, "documents", 10, 1200)}
                    uploadText="رفع ملف"
                  />
                </div>
              </div>
            </div>

            {/* Add other service types as needed... */}

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-3">
                <div className="accent-line"></div>
                ملاحظات إضافية
              </h3>
              <textarea
                name="notes"

                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-primary transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-medium text-base md:text-lg transition-all duration-300 active:scale-95 select-none flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  ارسال طلب الحجز
                  <ArrowRight size={20} className="rotate-180" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.section>
  );
};
