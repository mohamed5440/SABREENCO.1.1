import React from "react";
import {
  Briefcase,
  ShieldCheck,
  MapPin,
  Calendar,
  Bell,
  ArrowLeft,
  Search,
  FileText,
  User,
  Phone,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { HighlightText } from "../ui";
import { getStatusColor, optimizeImageUrl } from "../../lib/utils";

interface GlobalSearchResultsProps {
  searchQuery: string;
  filteredBookings: any[];
  filteredOffers: any[];
  filteredVisas: any[];
  filteredDestinations: any[];
  filteredSubscribers: any[];
  setActiveTab: (tab: string) => void;
  setEditingItem: (item: any) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  handleViewBookingDetails: (booking: any) => void;
  handleDeleteBooking: (id: any) => void;
  handleDeleteOffer: (id: any) => void;
  handleDeleteVisa: (id: any) => void;
  handleDeleteDestination: (id: any) => void;
  serviceTranslations: Record<string, string>;
  onClearSearch: () => void;
}

export function GlobalSearchResults({
  searchQuery,
  filteredBookings,
  filteredOffers,
  filteredVisas,
  filteredDestinations,
  filteredSubscribers,
  setActiveTab,
  setEditingItem,
  setIsModalOpen,
  handleViewBookingDetails,
  handleDeleteBooking,
  handleDeleteOffer,
  handleDeleteVisa,
  handleDeleteDestination,
  serviceTranslations,
  onClearSearch,
}: GlobalSearchResultsProps) {
  const totalMatches =
    filteredBookings.length +
    filteredOffers.length +
    filteredVisas.length +
    filteredDestinations.length +
    filteredSubscribers.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-right">
      {/* Search Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Search size={16} />
            <span className="text-xs font-semibold tracking-wider">نتائج البحث</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800">
            البحث عن: <span className="text-primary font-extrabold">"{searchQuery}"</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            تم العثور على <span className="text-primary font-bold">{totalMatches}</span> نتيجة مطابقة.
          </p>
        </div>
        <button
          onClick={onClearSearch}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary/20 hover:bg-primary/5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          إلغاء البحث والعودة
          <ArrowLeft size={14} />
        </button>
      </div>

      {totalMatches === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 mx-auto border border-gray-100">
            <Search size={20} />
          </div>
          <h3 className="text-sm font-bold text-gray-700">لا توجد نتائج مطابقة</h3>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            لم نجد أي سجلات تحتوي على "{searchQuery}" في الحجوزات أو العروض أو التأشيرات أو الوجهات أو المشتركين.
          </p>
          <button
            onClick={onClearSearch}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            عرض لوحة التحكم بالكامل
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Section 1: Bookings Matches */}
          {filteredBookings.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-white/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">طلبات الحجوزات المطابقة</h3>
                    <p className="text-[10px] text-gray-400 font-medium">تم العثور على {filteredBookings.length} طلب</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  إدارة الحجوزات <ExternalLink size={12} />
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-white/40 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800 text-sm">
                          <HighlightText text={booking.name || booking.user || "---"} search={searchQuery} />
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <span className="text-xs bg-white text-gray-500 px-2 py-0.5 rounded border border-gray-100 font-medium">
                          {serviceTranslations[booking.serviceType] || booking.serviceType || booking.service}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-x-4 gap-y-1 select-all font-mono" dir="ltr">
                        <span className="flex items-center gap-1 shrink-0">
                          <Phone size={12} className="text-gray-400" />
                          <HighlightText text={booking.phone || ""} search={searchQuery} />
                        </span>
                        <span className="text-gray-200 hidden sm:inline">•</span>
                        <span className="text-gray-400 truncate">
                          ID: <HighlightText text={booking.id} search={searchQuery} />
                        </span>
                        {booking.passportNumber && (
                          <>
                            <span className="text-gray-200 hidden sm:inline">•</span>
                            <span className="font-sans font-semibold text-gray-600">
                              جواز: <HighlightText text={booking.passportNumber} search={searchQuery} />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      <button
                        onClick={() => handleViewBookingDetails(booking)}
                        className="px-3 py-1.5 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <FileText size={12} />
                        عرض التفاصيل
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="p-1.5 text-primary hover:bg-primary-light hover:text-primary rounded-xl transition-all cursor-pointer border border-transparent active:scale-95"
                        title="حذف الحجز"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Offers Matches */}
          {filteredOffers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-white/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">عروض الرحلات المطابقة</h3>
                    <p className="text-[10px] text-gray-400 font-medium">تم العثور على {filteredOffers.length} عرض</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("offers")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  إدارة العروض <ExternalLink size={12} />
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredOffers.map((offer) => (
                  <div key={offer.id} className="p-4 hover:bg-white/40 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
                        {offer.image ? (
                          <img
                            decoding="async"
                            loading="lazy"
                            src={optimizeImageUrl(offer.image, 150)}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Briefcase size={16} className="text-gray-300 m-auto" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">
                            <HighlightText text={offer.title} search={searchQuery} />
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${offer.status === "نشط" ? "bg-primary-light text-primary border border-primary-soft-border" : "bg-primary-light text-primary-dark border border-primary-soft-border"}`}>
                            {offer.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-400 font-medium">
                          <span className="text-primary font-semibold">
                            <HighlightText text={String(offer.price)} search={searchQuery} /> {offer.currency}
                          </span>
                          <span>•</span>
                          <span>
                            <HighlightText text={offer.duration} search={searchQuery} />
                          </span>
                          <span>•</span>
                          <span>
                            قسم: <HighlightText text={offer.category} search={searchQuery} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      <button
                        onClick={() => {
                          setEditingItem(offer);
                          setIsModalOpen(true);
                          setActiveTab("offers");
                        }}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary/20 hover:bg-primary/5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                      >
                        تعديل العرض
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-1.5 text-primary hover:bg-primary-light hover:text-primary rounded-xl transition-all cursor-pointer border border-transparent"
                        title="حذف العرض"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Visas Matches */}
          {filteredVisas.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-white/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">خدمات التأشيرات المطابقة</h3>
                    <p className="text-[10px] text-gray-400 font-medium">تم العثور على {filteredVisas.length} تأشيرة</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("visas")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  إدارة التأشيرات <ExternalLink size={12} />
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredVisas.map((visa) => (
                  <div key={visa.id} className="p-4 hover:bg-white/40 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 shrink-0 flex items-center justify-center text-primary/75">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">
                            <HighlightText text={visa.title} search={searchQuery} />
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${visa.status === "نشط" ? "bg-primary-light text-primary border border-primary-soft-border" : "bg-primary-light text-primary-dark border border-primary-soft-border"}`}>
                            {visa.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-400 font-medium">
                          <span className="text-primary font-semibold">
                            <HighlightText text={String(visa.price)} search={searchQuery} /> {visa.currency}
                          </span>
                          <span>•</span>
                          <span>
                            الاستخراج: <HighlightText text={visa.processingTime} search={searchQuery} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      <button
                        onClick={() => {
                          setEditingItem(visa);
                          setIsModalOpen(true);
                          setActiveTab("visas");
                        }}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary/20 hover:bg-primary/5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                      >
                        تعديل التأشيرة
                      </button>
                      <button
                        onClick={() => handleDeleteVisa(visa.id)}
                        className="p-1.5 text-primary hover:bg-primary-light hover:text-primary rounded-xl transition-all cursor-pointer border border-transparent"
                        title="حذف التأشيرة"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Destinations Matches */}
          {filteredDestinations.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-white/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">الوجهات السياحية المطابقة</h3>
                    <p className="text-[10px] text-gray-400 font-medium">تم العثور على {filteredDestinations.length} وجهة</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("destinations")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  إدارة الوجهات <ExternalLink size={12} />
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredDestinations.map((dest) => (
                  <div key={dest.id} className="p-4 hover:bg-white/40 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
                        {dest.image ? (
                          <img
                            decoding="async"
                            loading="lazy"
                            src={optimizeImageUrl(dest.image, 150)}
                            alt={dest.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <MapPin size={16} className="text-gray-300 m-auto" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          <HighlightText text={dest.name} search={searchQuery} />
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-medium">
                          <span className="px-1.5 py-0.5 rounded bg-primary/5 text-primary font-semibold">
                            <HighlightText text={dest.category || ""} search={searchQuery} />
                          </span>
                          {dest.description && (
                            <span className="text-gray-400 line-clamp-1 max-w-sm">
                              <HighlightText text={dest.description} search={searchQuery} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      <button
                        onClick={() => {
                          setEditingItem(dest);
                          setIsModalOpen(true);
                          setActiveTab("destinations");
                        }}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary/20 hover:bg-primary/5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                      >
                        تعديل الوجهة
                      </button>
                      <button
                        onClick={() => handleDeleteDestination(dest.id)}
                        className="p-1.5 text-primary hover:bg-primary-light hover:text-primary rounded-xl transition-all cursor-pointer border border-transparent"
                        title="حذف الوجهة"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Subscribers Matches */}
          {filteredSubscribers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-white/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <Bell size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">المشتركون المطابقون</h3>
                    <p className="text-[10px] text-gray-400 font-medium">تم العثور على {filteredSubscribers.length} مشترك</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("subscribers")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  إدارة المشتركين <ExternalLink size={12} />
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredSubscribers.map((sub) => (
                  <div key={sub.id} className="p-4 hover:bg-white/40 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold shrink-0">
                        <User size={14} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          <HighlightText text={sub.name || "---"} search={searchQuery} />
                        </h4>
                        <p className="text-xs font-semibold text-primary font-mono select-all" dir="ltr">
                          <HighlightText text={sub.phone} search={searchQuery} />
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-gray-400 text-left">
                      تاريخ الاشتراك: {sub.created_at ? new Date(sub.created_at).toLocaleDateString("ar-EG") : "---"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
