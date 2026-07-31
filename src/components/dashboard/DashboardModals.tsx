import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Printer,
  Edit,
  Plus,
  MessageCircle,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Eye,
  Paperclip,
  Tag,
  Settings,
  HelpCircle,
} from "lucide-react";
import { WhatsAppIcon } from "../ui";
import { FeatureListEditor, ImageUploader, BookingStatusSelect } from "./DashboardShared";
import { parseStringArray, compressImage } from "../../lib/utils";

// ==========================================
// 1. BookingDetailsModal
// ==========================================
interface BookingDetailsModalProps {
  viewBooking: any;
  setViewBooking: (booking: any) => void;
  isFetchingBookingDetails: boolean;
  handleUpdateBookingStatus: (
    id: string | number,
    status: string,
  ) => Promise<void>;
  showToast: (message: string, type?: "success" | "error") => void;
}

export const BookingDetailsModal = React.memo(function BookingDetailsModal({
  viewBooking,
  setViewBooking,
  isFetchingBookingDetails,
  handleUpdateBookingStatus,
  showToast,
}: BookingDetailsModalProps) {
  return (
    <AnimatePresence>
      {viewBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white rounded-t-xl rounded-b-none sm:rounded-xl w-full max-w-xl flex flex-col h-[90dvh] sm:h-auto max-h-[90dvh] overflow-hidden border border-gray-150 relative mx-auto shadow-xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 border-b border-gray-100 bg-white/50 shrink-0 gap-3">
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight leading-tight">
                    تفاصيل الطلب المستلم
                  </h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-primary-light text-primary rounded-xl border border-primary-soft-border">
                    حجز نشط
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1 flex items-center gap-2 flex-wrap select-all">
                  <span>رقم الطلب: {String(viewBooking.id || "").slice(0, 12)}</span>
                  <span className="text-gray-200 hidden sm:inline">•</span>
                  <span>تاريخ التسجيل: {String(viewBooking.date || "")}</span>
                </p>
                {isFetchingBookingDetails && (
                  <div className="text-[10px] text-primary mt-1 font-medium animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                    جاري سحب المرفقات والبيانات الكاملة...
                  </div>
                )}
              </div>
              <button
                onClick={() => setViewBooking(null)}
                className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-xl transition-all cursor-pointer border border-gray-200 shrink-0"
                title="إغلاق"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
              {/* Quick Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-gray-100">
                {/* Service Badge */}
                <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col justify-center">
                  <span className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                    <Tag size={10} className="text-primary" /> نوع الخدمة
                  </span>
                  <p className="text-xs font-bold text-gray-700 truncate">
                    {String(
                      viewBooking.serviceType ||
                        viewBooking.service ||
                        "غير محدد",
                    )}
                  </p>
                </div>

                {/* Amount */}
                <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col justify-center">
                  <span className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                    <Paperclip size={10} className="text-primary" /> التكلفة المتوقعة
                  </span>
                  <p className="text-xs font-bold text-primary">
                    {viewBooking.amount || "يتم التنسيق لاحقاً"}
                  </p>
                </div>

                {/* Status Changer */}
                <div className="bg-white p-2 rounded-xl border border-gray-100 flex flex-col justify-center">
                  <span className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                    <Settings size={10} className="text-primary" /> الحالة والمتابعة
                  </span>
                  <div className="flex items-center gap-1">
                    <BookingStatusSelect
                      status={viewBooking.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        handleUpdateBookingStatus(viewBooking.id, newStatus);
                        setViewBooking({ ...viewBooking, status: newStatus });
                      }}
                      className="text-[10px] font-semibold bg-white border border-gray-100 rounded-xl px-1 py-0.5 w-full text-right h-7"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-primary rounded-full shrink-0" />
                  بيانات العميل الشخصية
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name */}
                  <div className="bg-white/50 p-3 rounded-xl border border-gray-100 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                      <User size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-400 block text-[10px] font-medium">الاسم الكامل</span>
                      <span className="font-semibold text-gray-700 text-xs sm:text-sm truncate block">
                        {String(viewBooking.name || viewBooking.user || "---")}
                      </span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="bg-white/50 p-3 rounded-xl border border-gray-100 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                      <Phone size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-400 block text-[10px] font-medium">رقم الهاتف للتواصل</span>
                      <span className="font-semibold text-gray-700 font-mono text-xs sm:text-sm block truncate" dir="ltr">
                        {String(viewBooking.phone || "---")}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-white/50 p-3 rounded-xl border border-gray-100 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                      <Mail size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-400 block text-[10px] font-medium">البريد الإلكتروني</span>
                      <span className="font-semibold text-gray-700 text-xs sm:text-sm break-all block">
                        {String(viewBooking.email || "---")}
                      </span>
                    </div>
                  </div>

                  {/* Passport Number */}
                  <div className="bg-white/50 p-3 rounded-xl border border-gray-100 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                      <ShieldCheck size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-400 block text-[10px] font-medium">رقم جواز السفر</span>
                      <span className="font-semibold text-gray-700 uppercase text-xs sm:text-sm block">
                        {String(viewBooking.passportNumber || "---")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Technical Details */}
              {typeof viewBooking.details === "string" &&
                viewBooking.details.trim() !== "" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-500 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-primary rounded-full shrink-0" />
                      تفاصيل الخدمة والخيارات المختارة
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-gray-100 rounded-xl p-3">
                      {viewBooking.details
                        .split("\n")
                        .filter((line: string) => line.includes(":") && !line.startsWith("ملاحظات:"))
                        .map((line: string, idx: number) => {
                          const [key, ...valueParts] = line.split(":");
                          const value = valueParts.join(":").trim();
                          if (!value) return null;
                          return (
                            <div key={idx} className="bg-white/50 p-2.5 rounded border border-gray-100 flex flex-col justify-center">
                              <span className="text-gray-400 text-[10px] font-medium mb-1 flex items-center gap-1">
                                <HelpCircle size={10} className="text-primary" />
                                {key.trim()}
                              </span>
                              <span className="font-bold text-gray-700 text-xs sm:text-sm">
                                {value}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

              {/* Customer Notes */}
              {viewBooking.details?.includes("ملاحظات:") && (
                <div className="bg-primary-light text-primary-dark p-4 rounded-xl border border-primary-soft-border">
                  <span className="flex items-center gap-1.5 font-bold mb-1 text-xs sm:text-sm text-primary-dark">
                    <MessageCircle size={14} className="text-primary" /> ملاحظات خاصة بالعميل:
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-600 font-medium text-xs sm:text-sm">
                    {viewBooking.details.split("ملاحظات:")[1].trim()}
                  </p>
                </div>
              )}

              {/* Attachments Section */}
              {(viewBooking.passportImage ||
                viewBooking.personalPhoto ||
                (viewBooking.documents &&
                  viewBooking.documents.length > 0)) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-primary rounded-full shrink-0" />
                    المرفقات والمستندات المحملة
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        label: "صورة جواز السفر",
                        value: viewBooking.passportImage,
                      },
                      {
                        label: "الصورة الشخصية للعميل",
                        value: viewBooking.personalPhoto,
                      },
                      ...(Array.isArray(viewBooking.documents)
                        ? viewBooking.documents.map(
                            (doc: string, idx: number) => ({
                              label: `مستند إضافي ${idx + 1}`,
                              value: doc,
                            }),
                          )
                        : typeof viewBooking.documents === "string" &&
                            viewBooking.documents.trim()
                          ? [
                              {
                                label: "مستندات إضافية مرفقة",
                                value: viewBooking.documents,
                              },
                            ]
                          : []),
                    ]
                      .filter(
                        (att) =>
                          typeof att.value === "string" &&
                          att.value.trim().length > 0,
                      )
                      .map((att, i) => {
                        const safeHref =
                          att.value.startsWith("data:") ||
                          att.value.startsWith("http")
                            ? att.value
                            : "#";
                        return (
                          <a
                            key={i}
                            href={safeHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-gray-100 rounded-xl p-2 bg-white hover:bg-white transition-all group cursor-pointer"
                          >
                            <div className="w-10 h-10 bg-white rounded overflow-hidden border border-gray-100 shrink-0 relative flex items-center justify-center">
                              {safeHref.startsWith("data:image") ||
                              safeHref.startsWith("http") ? (
                                <img
                                  decoding="async"
                                  loading="lazy"
                                  src={safeHref}
                                  alt={att.label}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-sm">📄</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 text-right">
                              <span className="text-xs font-semibold text-gray-700 block truncate group-hover:text-primary transition-colors">
                                {att.label}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium block mt-0.5 flex items-center gap-1">
                                <Eye size={10} className="text-primary/75" /> انقر للمعاينة
                              </span>
                            </div>
                          </a>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-4 py-3 sm:px-6 bg-white/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const phone = viewBooking.phone
                      ? String(viewBooking.phone).replace(/\D/g, "")
                      : "";
                    if (!phone) {
                      showToast("رقم الهاتف غير متوفر للعميل", "error");
                      return;
                    }
                    const message = `مرحباً ${
                      viewBooking.name || viewBooking.user
                    }، بخصوص طلب حجزك لدى صابرينكو (${
                      viewBooking.serviceType || viewBooking.service
                    })...`;
                    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                    try {
                      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                    } catch (e) {
                      console.warn("window.open blocked in sandbox", e);
                    }
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  <WhatsAppIcon size={12} />
                  <span>تواصل واتساب</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-white transition cursor-pointer"
                >
                  <Printer size={12} />
                  <span>طباعة البيانات</span>
                </button>
              </div>

              <button
                onClick={() => setViewBooking(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition text-center cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ==========================================
// 2. ItemFormModal
// ==========================================
interface ItemFormModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  activeTab: string;
  editingItem: any;
  setEditingItem: (item: any) => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSave: (e: React.FormEvent) => Promise<void>;
  showToast: (message: string, type?: "success" | "error") => void;
}

export const ItemFormModal = React.memo(function ItemFormModal({
  isModalOpen,
  setIsModalOpen,
  activeTab,
  editingItem,
  setEditingItem,
  formData,
  setFormData,
  handleSave,
  showToast,
}: ItemFormModalProps) {
  const [featureInput, setFeatureInput] = useState("");

  const handleAddItem = (
    fieldName: "features",
    inputValue: string,
    setInputValue: (val: string) => void,
    e?: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent,
  ) => {
    if (e && "key" in e && e.key !== "Enter") return;
    if (e) e.preventDefault();
    if (inputValue.trim()) {
      const currentItems = parseStringArray(formData[fieldName]);
      setFormData({
        ...formData,
        [fieldName]: [...currentItems, inputValue.trim()],
      });
      setInputValue("");
    }
  };

  const handleAddFeature = (
    e?: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent,
  ) => {
    handleAddItem("features", featureInput, setFeatureInput, e);
  };

  const handleRemoveItem = (
    fieldName: "features",
    index: number,
  ) => {
    const currentItems = parseStringArray(formData[fieldName]);
    const newItems = [...currentItems];
    newItems.splice(index, 1);
    setFormData({ ...formData, [fieldName]: newItems });
  };

  const removeFeature = (index: number) => handleRemoveItem("features", index);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast(
          "حجم الصورة كبير جداً. الحد الأقصى هو 10 ميجابايت لتجنب مشاكل الحفظ.",
          "error",
        );
        return;
      }
      try {
        const compressedBase64 = await compressImage(file, 1200);
        setFormData({ ...formData, image: compressedBase64 });
      } catch (error) {
        console.error("Error compressing image:", error);
        showToast("حدث خطأ أثناء معالجة الصورة", "error");
      }
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`bg-white rounded-t-xl rounded-b-none sm:rounded-xl w-full border border-gray-150 flex flex-col overflow-hidden transition-all duration-300 shadow-xl ${
              activeTab === "offers"
                ? "max-w-5xl h-[92dvh] sm:h-auto max-h-[92dvh]"
                : "max-w-3xl h-[90dvh] sm:h-auto max-h-[90dvh]"
            }`}
          >
            {/* Modal Header */}
            <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100 flex justify-between items-center bg-white/50 shrink-0 gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 text-right">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/10">
                  {editingItem ? (
                    <Edit size={14} />
                  ) : (
                    <Plus size={14} />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                    {editingItem ? "تعديل بيانات" : "إضافة"}{" "}
                    {activeTab === "offers"
                      ? "عرض رحلة سياحية"
                      : activeTab === "visas"
                        ? "تأشيرة دخول جديدة"
                        : "وجهة سياحية مميزة"}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 font-medium truncate">
                    يرجى مراجعة وتعبئة الحقول المطلوبة بالبيانات الصحيحة للنشر
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                  setFormData({});
                }}
                className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-xl transition-all cursor-pointer border border-gray-200 shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <form
                id="itemForm"
                onSubmit={handleSave}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar space-y-5">
                  {activeTab === "offers" && (
                    <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
                      {/* Right Side - Main Content (RTL) */}
                      <div className="flex-1 space-y-4">
                        {/* Image Uploader */}
                        <div className="bg-white/50 p-3 rounded-xl border border-gray-100">
                          <ImageUploader
                            image={formData.image}
                            onChange={(url) =>
                              setFormData({ ...formData, image: url })
                            }
                            onFileUpload={handleFileUpload}
                            label="صورة العرض الرئيسية للموقع"
                            uploadButtonText="انقر لرفع صورة العرض من جهازك"
                          />
                        </div>

                        {/* Text Inputs */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-gray-700 block mb-2 flex items-center gap-1">
                              <span>عنوان العرض السياحي المميز</span>
                              <span className="text-primary">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.title || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  title: e.target.value,
                                })
                              }
                              className="w-full bg-white/50 hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:border-primary focus:outline-none transition-all"

                            />
                          </div>

                          <div className="bg-white/50 p-3 rounded-xl border border-gray-100 space-y-4">
                            <div>
                              <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-3 bg-primary rounded-full shrink-0" />
                                التفاصيل والمسار اليومي الكامل
                              </label>
                              <textarea
                                value={formData.description || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    description: e.target.value,
                                  })
                                }
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:border-primary focus:outline-none transition-all min-h-[140px] resize-y leading-relaxed"

                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Left Side (Sidebar) - Specifications & Settings */}
                      <div className="w-full lg:w-80 bg-white/50 rounded-xl p-3.5 border border-gray-100 space-y-4 shrink-0">
                        {/* Pricing and Location Card */}
                        <div className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-4">
                          <h4 className="font-bold text-gray-700 text-xs border-b border-gray-100 pb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            بيانات السعر والوجهة
                          </h4>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                تكلفة العرض الأساسية
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={formData.price || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      price: e.target.value,
                                    })
                                  }
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:border-primary transition-all text-left font-mono h-9"
                                  dir="ltr"

                                />
                                <input
                                  type="text"
                                  value={formData.currency || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      currency: e.target.value,
                                    })
                                  }
                                  className="w-16 shrink-0 bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs font-bold text-gray-700 focus:border-primary transition-all text-center h-9"

                                />
                              </div>
                            </div>

                            <div className="col-span-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                مدة العرض
                              </label>
                              <input
                                type="text"
                                value={formData.duration || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    duration: e.target.value,
                                  })
                                }
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:border-primary transition-all h-9"

                              />
                            </div>

                            <div className="col-span-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                الوجهة والمكان
                              </label>
                              <input
                                type="text"
                                value={formData.destination || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    destination: e.target.value,
                                  })
                                }
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:border-primary transition-all h-9"

                              />
                            </div>
                          </div>
                        </div>

                        {/* Publication Status */}
                        <div className="bg-white p-3.5 rounded-xl border border-gray-100">
                          <label className="text-xs font-semibold text-gray-700 block mb-2">
                            حالة نشر العرض في الموقع
                          </label>
                          <select
                            value={formData.status || "نشط"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                status: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:border-primary transition-all outline-none h-9"
                          >
                            <option value="نشط">نشط - يظهر فوراً للعملاء</option>
                            <option value="غير نشط">مسودة - إخفاء مؤقت</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "visas" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Visa Details Side */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 pb-1.5 border-b border-gray-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-3 bg-primary rounded-full shrink-0" />
                          المعلومات والمستندات للتأشيرة
                        </h3>

                        {/* Image Uploader */}
                        <div className="bg-white/50 p-3 rounded-xl border border-gray-100">
                          <ImageUploader
                            image={formData.image}
                            onChange={(url) =>
                              setFormData({ ...formData, image: url })
                            }
                            onFileUpload={handleFileUpload}
                            label="صورة أو أيقونة التأشيرة التعبيرية"
                            uploadButtonText="انقر لرفع صورة التأشيرة"
                          />
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                              <span>اسم ومسمى التأشيرة</span>
                              <span className="text-primary">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.title || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  title: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:bg-white focus:border-primary focus:outline-none transition-all"

                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="col-span-1">
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                رسوم التأشيرة
                              </label>
                              <input
                                type="text"
                                value={formData.price || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    price: e.target.value,
                                  })
                                }
                                className="w-full bg-white hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:border-primary transition-all text-left font-mono h-9"
                                dir="ltr"

                              />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                العملة
                              </label>
                              <input
                                type="text"
                                value={formData.currency || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    currency: e.target.value,
                                  })
                                }
                                className="w-full bg-white hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:border-primary transition-all text-center h-9"

                              />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                صلاحية الإقامة
                              </label>
                              <input
                                type="text"
                                value={formData.duration || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    duration: e.target.value,
                                  })
                                }
                                className="w-full bg-white hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:border-primary transition-all h-9"

                              />
                            </div>
                          </div>

                          <div className="bg-white/50 p-3 rounded-xl border border-gray-100 space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                عنوان شرح وتفاصيل التأشيرة
                              </label>
                              <input
                                type="text"
                                value={formData.descriptionTitle || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    descriptionTitle: e.target.value,
                                  })
                                }
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:border-primary transition-all h-9"

                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                الوصف التعريفي للتأشيرة
                              </label>
                              <textarea
                                value={formData.description || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    description: e.target.value,
                                  })
                                }
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:border-primary transition-all min-h-[110px] resize-y leading-relaxed"

                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Requirements Visa Side */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 pb-1.5 border-b border-gray-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-3 bg-primary rounded-full shrink-0" />
                          متطلبات وشروط الإنجاز
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                              الوقت المتوقع للاستخراج والإنجاز
                            </label>
                            <input
                              type="text"
                              value={formData.processingTime || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  processingTime: e.target.value,
                                })
                              }
                              className="w-full bg-white hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-primary transition-all"

                            />
                          </div>

                          <div className="bg-white/50 p-3 rounded-xl border border-gray-100">
                            <FeatureListEditor
                              items={formData.features}
                              inputValue={featureInput}
                              onInputChange={setFeatureInput}
                              onAdd={handleAddFeature}
                              onRemove={removeFeature}
                              label="الأوراق والوثائق المطلوبة من العميل"

                              themeColor="primary"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                              حالة نشر التأشيرة في الموقع
                            </label>
                            <select
                              value={formData.status || "نشط"}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  status: e.target.value,
                                })
                              }
                              className="w-full bg-white hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:border-primary transition-all cursor-pointer outline-none"
                            >
                              <option value="نشط">نشط - تظهر للعملاء فوراً</option>
                              <option value="غير نشط">مخفية مؤقتاً</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "destinations" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Destination Info */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 pb-1.5 border-b border-gray-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-3 bg-primary rounded-full shrink-0" />
                          بيانات الوجهة الأساسية
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                              <span>اسم الوجهة / المدينة والدولة</span>
                              <span className="text-primary">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.name || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full bg-white hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-primary transition-all"

                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                              تصنيف السياحة بالوجهة
                            </label>
                            <input
                              type="text"
                              value={formData.category || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  category: e.target.value,
                                })
                              }
                              className="w-full bg-white hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-primary transition-all"

                            />
                          </div>
                        </div>
                      </div>

                      {/* Destination Visuals and Bio */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 pb-1.5 border-b border-gray-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-3 bg-primary rounded-full shrink-0" />
                          الوسائط التعبيرية والنبذة
                        </h3>

                        <div className="space-y-4">
                          <div className="bg-white/50 p-3 rounded-xl border border-gray-100">
                            <ImageUploader
                              image={formData.image}
                              onChange={(url) =>
                                setFormData({ ...formData, image: url })
                              }
                              onFileUpload={handleFileUpload}
                              label="رابط الصورة أو رفع صورة للوجهة"
                              uploadButtonText="انقر لرفع صورة معبرة للوجهة"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                              نبذة تعريفية شاملة عن الوجهة السياحية
                            </label>
                            <textarea
                              value={formData.description || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                              className="w-full bg-white hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-primary transition-all min-h-[120px] resize-y leading-relaxed"

                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Submit Footer Action */}
                <div className="p-4 border-t border-gray-100 bg-white/50 shrink-0">
                  <button
                    type="submit"
                    form="itemForm"
                    className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all text-xs sm:text-sm cursor-pointer"
                  >
                    {editingItem ? <Edit size={14} /> : <Plus size={14} />}
                    <span>{editingItem ? "حفظ وتعديل البيانات" : "إضافة ونشر العنصر الجديد"}</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
