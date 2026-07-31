import React from "react";
import {
  Briefcase,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Share2,
  Settings,
  Lightbulb,
  Plus,
  RefreshCw,
  Trash2,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
  FileText
} from "lucide-react";
import {
  StatBox,
  DashboardTabHeader,
  UniversalItemsView,
  BookingStatusSelect
} from "./DashboardShared";
import { HighlightText, WhatsAppIcon } from "../ui";
import { getStatusColor } from "../../lib/utils";
import { apiService } from "../../lib/apiService";

// ==========================================
// 1. OverviewTab
// ==========================================
interface OverviewTabProps {
  offers: any[];
  visas: any[];
  destinations: any[];
  bookings: any[];
  socialLinks: any[];
  pendingBookingsCount: number;
  setActiveTab: (tab: string) => void;
  setEditingItem: (item: any) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

export const OverviewTab = React.memo(function OverviewTab({
  offers,
  visas,
  destinations,
  bookings,
  socialLinks,
  pendingBookingsCount,
  setActiveTab,
  setEditingItem,
  setIsModalOpen,
}: OverviewTabProps) {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 min-[540px]:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {[
          { icon: <Briefcase size={20} />, label: "العروض", value: offers.length },
          { icon: <ShieldCheck size={20} />, label: "التأشيرات", value: visas.length },
          { icon: <MapPin size={20} />, label: "الوجهات", value: destinations.length },
          { icon: <Calendar size={20} />, label: "الحجوزات", value: bookings.length },
          { icon: <Clock size={20} />, label: "طلبات معلقة", value: pendingBookingsCount },
          { icon: <Share2 size={20} />, label: "الروابط", value: socialLinks.length },
        ].map((stat, i) => (
          <StatBox key={i} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-150 overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <h3 className="text-base font-semibold text-gray-800">أحدث الحجوزات</h3>
            <button
              onClick={() => setActiveTab("bookings")}
              className="text-sm font-medium text-primary hover:underline transition-all cursor-pointer"
            >
              عرض الكل
            </button>
          </div>

          <div className="flex md:hidden flex-col divide-y divide-gray-100">
            {bookings.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="p-4 space-y-3 hover:bg-white/50 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-800 text-sm truncate">
                      {booking.user || booking.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium mt-0.5 select-all font-mono" dir="ltr">
                      {String(booking.phone || booking.id || "")}
                    </div>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400 shrink-0">الخدمة:</span>
                    <span className="font-medium text-gray-700 truncate">{booking.service || booking.serviceType}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400 shrink-0">التاريخ:</span>
                    <span className="font-medium text-gray-400 font-mono">{booking.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto custom-scrollbar-horizontal pb-2">
            <table className="w-full text-right min-w-[600px]">
              <thead className="bg-white/50 border-b border-gray-100">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-[10px] font-semibold text-gray-500">العميل</th>
                  <th className="px-4 md:px-6 py-3 text-[10px] font-semibold text-gray-500">الخدمة</th>
                  <th className="px-4 md:px-6 py-3 text-[10px] font-semibold text-gray-500">التاريخ</th>
                  <th className="px-4 md:px-6 py-3 text-[10px] font-semibold text-gray-500 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.slice(0, 5).map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-4 md:px-6 py-3.5">
                      <div className="font-medium text-gray-800 text-sm truncate max-w-[150px] sm:max-w-[200px]">
                        {booking.user || booking.name}
                      </div>
                      <div className="text-xs text-gray-400 font-medium truncate max-w-[150px] sm:max-w-[200px]">
                        {booking.id}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3.5">
                      <span className="text-sm font-medium text-gray-700">{booking.service || booking.serviceType}</span>
                    </td>
                    <td className="px-4 md:px-6 py-3.5">
                      <span className="text-sm font-medium text-gray-500">{booking.date}</span>
                    </td>
                    <td className="px-4 md:px-6 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium bg-white">
                      لا توجد حجوزات مسجلة بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-150">
            <h3 className="text-base font-semibold text-gray-800 mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <button
                onClick={() => {
                  setActiveTab("offers");
                  setEditingItem(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-150 hover:border-primary/30 hover:bg-primary/5 transition-all text-right bg-white w-full cursor-pointer"
              >
                <div className="w-9 h-9 bg-primary/5 text-primary rounded flex items-center justify-center shrink-0 border border-primary/10">
                  <Plus size={18} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">إضافة عرض جديد</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">نشر رحلة أو باقة جديدة</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab("visas");
                  setEditingItem(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-150 hover:border-primary/30 hover:bg-primary/5 transition-all text-right bg-white w-full cursor-pointer"
              >
                <div className="w-9 h-9 bg-primary/5 text-primary rounded flex items-center justify-center shrink-0 border border-primary/10">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">إضافة تأشيرة</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">تحديث قائمة التأشيرات المتاحة</div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-150 hover:border-primary/30 hover:bg-primary/5 transition-all text-right bg-white w-full cursor-pointer"
              >
                <div className="w-9 h-9 bg-primary/5 text-primary rounded flex items-center justify-center shrink-0 border border-primary/10">
                  <Settings size={18} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">إعدادات التواصل</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">تحديث أرقام الهاتف والروابط</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 p-5 rounded-xl">
            <div className="flex flex-col items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                <Lightbulb size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-base mb-1.5 text-primary">نصيحة اليوم</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  قم بتحديث صور العروض بانتظام لجذب المزيد من العملاء. الصور عالية الجودة تزيد من نسبة الحجز بنسبة 40%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ==========================================
// 2. BookingsTab
// ==========================================
interface BookingsTabProps {
  filteredBookings: any[];
  searchQuery: string;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  serviceFilter: string;
  setServiceFilter: (service: string) => void;
  bookingServices: string[];
  serviceTranslations: Record<string, string>;
  handleUpdateBookingStatus: (id: any, status: string) => void;
  handleViewBookingDetails: (booking: any) => void;
  handleDeleteBooking: (id: any) => void;
}

export const BookingsTab = React.memo(function BookingsTab({
  filteredBookings,
  searchQuery,
  statusFilter,
  setStatusFilter,
  serviceFilter,
  setServiceFilter,
  bookingServices,
  serviceTranslations,
  handleUpdateBookingStatus,
  handleViewBookingDetails,
  handleDeleteBooking,
}: BookingsTabProps) {
  return (
    <>
      <DashboardTabHeader title="قائمة الحجوزات" count={filteredBookings.length}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-semibold bg-white/50 hover:bg-white border border-gray-200 rounded-xl px-3 py-2 focus:border-primary transition-all outline-none w-full min-[480px]:w-auto min-[480px]:min-w-[120px] cursor-pointer"
        >
          <option value="الكل">جميع الحالات</option>
          <option value="قيد الانتظار">قيد الانتظار</option>
          <option value="مكتمل">مكتمل</option>
          <option value="ملغي">ملغي</option>
        </select>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="text-xs font-semibold bg-white/50 hover:bg-white border border-gray-200 rounded-xl px-3 py-2 focus:border-primary transition-all outline-none w-full min-[480px]:w-auto min-[480px]:min-w-[120px] cursor-pointer"
        >
          <option value="الكل">جميع الخدمات</option>
          {bookingServices
            .filter((s) => s !== "الكل")
            .map((service) => (
              <option key={service} value={service}>
                {serviceTranslations[service] || service}
              </option>
            ))}
        </select>
      </DashboardTabHeader>

      <div className="hidden md:block overflow-x-auto custom-scrollbar-horizontal pb-4">
        <table className="w-full text-right min-w-[800px]">
          <thead className="bg-white/50 sticky top-0 z-10 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500">العميل</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500">الخدمة</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500">التاريخ</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500">المبلغ</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 text-center">الحالة</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 text-left w-24">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-white/50 transition-all group">
                <td className="px-6 py-4 font-medium text-gray-800 text-sm max-w-[200px] sm:max-w-xs">
                  <div className="truncate">
                    <HighlightText text={booking.name || booking.user || "---"} search={searchQuery} />
                  </div>
                  <div className="text-xs text-gray-400 font-medium truncate mt-0.5">
                    <HighlightText text={booking.phone || booking.id || ""} search={searchQuery} />
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-700 text-sm">
                  <HighlightText text={serviceTranslations[booking.serviceType] || booking.serviceType || booking.service || ""} search={searchQuery} />
                </td>
                <td className="px-6 py-4 font-medium text-gray-700 text-sm">
                  <HighlightText text={booking.date || ""} search={searchQuery} />
                </td>
                <td className="px-6 py-4 font-medium text-primary text-sm">
                  {booking.amount ? <HighlightText text={String(booking.amount)} search={searchQuery} /> : "-"}
                </td>
                <td className="px-6 py-4 text-center">
                  <BookingStatusSelect
                    status={booking.status}
                    onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                    className="inline-flex items-center justify-center px-3 py-1 rounded text-xs font-medium border"
                  />
                </td>
                <td className="px-6 py-4 text-left">
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      onClick={() => handleViewBookingDetails(booking)}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded transition-all cursor-pointer"
                      title="عرض التفاصيل"
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded transition-all cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium bg-white">
                  لا توجد حجوزات مطابقة للبحث أو الفلتر
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden">
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="p-4 bg-white rounded-xl border border-gray-150 hover:shadow-sm transition-all duration-300 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm truncate">
                      <HighlightText text={booking.name || booking.user || "---"} search={searchQuery} />
                    </h4>
                    <div className="text-[10px] text-gray-400 font-medium mt-0.5 select-all font-mono">
                      <HighlightText text={booking.phone || booking.id || ""} search={searchQuery} />
                    </div>
                  </div>
                  <BookingStatusSelect
                    status={booking.status}
                    onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                    className="px-2 py-0.5 rounded text-[10px] font-medium border shrink-0"
                  />
                </div>

                <div className="space-y-1.5 text-xs pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400 shrink-0">الخدمة:</span>
                    <span className="font-medium text-gray-800 truncate">
                      {serviceTranslations[booking.serviceType] || booking.serviceType || booking.service || ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400 shrink-0">التاريخ:</span>
                    <span className="font-medium text-gray-500 font-mono">{booking.date}</span>
                  </div>
                  {booking.amount && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-gray-400 shrink-0">المبلغ:</span>
                      <span className="font-semibold text-primary">{booking.amount}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleViewBookingDetails(booking)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-primary/5 text-primary rounded-xl font-medium text-xs transition-all hover:bg-primary/10 cursor-pointer"
                  >
                    <FileText size={14} />
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="p-1.5 bg-primary-light text-primary rounded-xl transition-all hover:bg-primary-soft-border shrink-0 cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400 font-medium bg-white rounded-xl border border-gray-150">
            لا توجد حجوزات مطابقة للبحث أو الفلتر
          </div>
        )}
      </div>
    </>
  );
});

// ==========================================
// 3. GenericItemsTab (replaces OffersTab, VisasTab, DestinationsTab to remove duplication)
// ==========================================
interface GenericItemsTabProps {
  items: any[];
  searchQuery: string;
  itemType: "offers" | "visas" | "destinations";
  title: string;
  defaultCurrency?: string;
  statusFilter?: string;
  setStatusFilter?: (status: string) => void;
  categoryFilter?: string;
  setCategoryFilter?: (category: string) => void;
  categories?: string[];
  handleMoveItem: (tab: string, id: any, direction: "up" | "down") => void;
  handleDuplicateItem?: (item: any) => void;
  setEditingItem: (item: any) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  handleDeleteItem: (id: any) => void;
}

export const GenericItemsTab = React.memo(function GenericItemsTab({
  items,
  searchQuery,
  itemType,
  title,
  defaultCurrency,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  handleMoveItem,
  handleDuplicateItem,
  setEditingItem,
  setIsModalOpen,
  handleDeleteItem,
}: GenericItemsTabProps) {
  return (
    <>
      <DashboardTabHeader title={title} count={items.length}>
        {categories && setCategoryFilter && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold bg-white/50 hover:bg-white border border-gray-200 rounded-xl px-3 py-2 focus:border-primary transition-all outline-none w-full min-[480px]:w-auto min-[480px]:min-w-[120px] cursor-pointer"
          >
            <option value="الكل">جميع الأقسام</option>
            {categories
              .filter((c) => c !== "الكل")
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
        )}
        {statusFilter !== undefined && setStatusFilter && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-white/50 hover:bg-white border border-gray-200 rounded-xl px-3 py-2 focus:border-primary transition-all outline-none w-full min-[480px]:w-auto min-[480px]:min-w-[120px] cursor-pointer"
          >
            <option value="الكل">جميع الحالات</option>
            <option value="نشط">نشط</option>
            <option value="غير نشط">غير نشط</option>
          </select>
        )}
      </DashboardTabHeader>

      <UniversalItemsView
        items={items}
        searchQuery={searchQuery}
        itemType={itemType}
        defaultCurrency={defaultCurrency}
        onMoveItem={handleMoveItem}
        onDuplicateItem={handleDuplicateItem}
        onEditItem={(item) => {
          setEditingItem(item);
          setIsModalOpen(true);
        }}
        onDeleteItem={handleDeleteItem}
      />
    </>
  );
});

// Keep the specific tab components as simple wrappers for backward compatibility with DashboardPage
export const OffersTab = React.memo(function OffersTab(props: any) {
  return (
    <GenericItemsTab
      {...props}
      items={props.filteredOffers}
      itemType="offers"
      title="قائمة العروض"
      defaultCurrency="جنيه مصري"
      statusFilter={props.offerStatusFilter}
      setStatusFilter={props.setOfferStatusFilter}
      handleDuplicateItem={props.handleDuplicateOffer}
      handleDeleteItem={props.handleDeleteOffer}
    />
  );
});

export const VisasTab = React.memo(function VisasTab(props: any) {
  return (
    <GenericItemsTab
      {...props}
      items={props.filteredVisas}
      itemType="visas"
      title="قائمة التأشيرات"
      defaultCurrency="درهم"
      statusFilter={props.visaStatusFilter}
      setStatusFilter={props.setVisaStatusFilter}
      handleDuplicateItem={props.handleDuplicateVisa}
      handleDeleteItem={props.handleDeleteVisa}
    />
  );
});

export const DestinationsTab = React.memo(function DestinationsTab(props: any) {
  return (
    <GenericItemsTab
      {...props}
      items={props.filteredDestinations}
      itemType="destinations"
      title="قائمة الوجهات"
      handleDeleteItem={props.handleDeleteDestination}
    />
  );
});

// ==========================================
// 6. SubscribersTab
// ==========================================
interface SubscribersTabProps {
  subscribers: any[];
  filteredSubscribers: any[];
  searchQuery: string;
  setSubscribers: React.Dispatch<React.SetStateAction<any[]>>;
  setConfirmModal: (modal: { message: string; onConfirm: () => void } | null) => void;
  showToast: (message: string, type?: "success" | "error") => void;
}

export const SubscribersTab = React.memo(function SubscribersTab({
  subscribers,
  filteredSubscribers,
  searchQuery,
  setSubscribers,
  setConfirmModal,
  showToast,
}: SubscribersTabProps) {
  const handleRefresh = async () => {
    try {
      const data = await apiService.getSubscribers();
      setSubscribers(data || []);
      showToast("تم تحديث قائمة المشتركين");
    } catch {
      showToast("فشل التحديث", "error");
    }
  };

  const handleDeleteSubscriber = (subId: any) => {
    setConfirmModal({
      message: "هل أنت متأكد من حذف هذا المشترك؟ سيؤدي ذلك لإزالته نهائياً.",
      onConfirm: async () => {
        try {
          await apiService.deleteSubscriber(subId);
          setSubscribers((prev) => prev.filter((s) => s.id !== subId));
          showToast("تم حذف المشترك بنجاح");
        } catch {
          showToast("فشل الحذف", "error");
        }
        setConfirmModal(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-150 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <h3 className="text-base font-semibold text-gray-800 flex flex-wrap items-center gap-2 md:gap-3">
            المشتركون في تنبيهات الواتساب
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{subscribers.length} مشترك</span>
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 bg-white text-gray-500 hover:text-primary rounded-xl transition-all border border-gray-200 cursor-pointer"
              title="تحديث القائمة"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto custom-scrollbar-horizontal pb-4">
          <table className="w-full text-right min-w-[700px]">
            <thead className="bg-white/50 sticky top-0 z-10 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500">الاسم</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 text-right">رقم الهاتف</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500">تاريخ الاشتراك</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 text-left w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSubscribers.map((sub: any) => (
                <tr key={sub.id} className="group hover:bg-white/50 transition-all">
                  <td className="px-6 py-4 font-medium text-gray-800 text-sm">
                    <HighlightText text={sub.name || "---"} search={searchQuery} />
                  </td>
                  <td className="px-6 py-4 font-medium text-primary text-sm text-right" dir="ltr">
                    <HighlightText text={sub.phone} search={searchQuery} />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-500 text-sm">
                    {sub.created_at
                      ? (() => {
                          try {
                            return new Date(sub.created_at).toLocaleDateString("ar-EG", { dateStyle: "medium" });
                          } catch {
                            return "---";
                          }
                        })()
                      : "---"}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleDeleteSubscriber(sub.id)}
                      className="p-1.5 bg-primary-light text-primary rounded-xl hover:bg-primary-soft-border transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-400 font-medium bg-white">
                    {subscribers.length === 0 ? "لا يوجد مشتركون حالياً" : "لا توجد نتائج تطابق بحثك"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden divide-y divide-gray-100 bg-white">
          {filteredSubscribers.map((sub: any) => (
            <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-white/50 transition-all gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="font-medium text-gray-800 text-sm truncate">
                  <HighlightText text={sub.name || "---"} search={searchQuery} />
                </h4>
                <p className="text-primary text-xs font-medium text-right" dir="ltr">
                  <HighlightText text={sub.phone} search={searchQuery} />
                </p>
                <p className="text-gray-400 text-[10px] font-medium mt-1">
                  {sub.created_at
                    ? (() => {
                        try {
                          return new Date(sub.created_at).toLocaleDateString("ar-EG", { dateStyle: "medium" });
                        } catch {
                          return "---";
                        }
                      })()
                    : "---"}
                </p>
              </div>
              <button
                onClick={() => handleDeleteSubscriber(sub.id)}
                className="p-2 bg-primary-light text-primary rounded-xl transition-all shrink-0 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {filteredSubscribers.length === 0 && (
            <div className="p-8 text-center text-gray-400 font-medium text-sm">
              {subscribers.length === 0 ? "لا يوجد مشتركون حالياً" : "لا توجد نتائج تطابق بحثك"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ==========================================
// 7. SettingsTab
// ==========================================
interface SettingsTabProps {
  localSocialLinks: any[];
  setLocalSocialLinks: React.Dispatch<React.SetStateAction<any[]>>;
  localContactInfo: any;
  setLocalContactInfo: React.Dispatch<React.SetStateAction<any>>;
  handleSaveSettings: () => Promise<void>;
}

export const SettingsTab = React.memo(function SettingsTab({
  localSocialLinks,
  setLocalSocialLinks,
  localContactInfo,
  setLocalContactInfo,
  handleSaveSettings,
}: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Social Media Links */}
        <div className="bg-white rounded-xl border border-gray-150 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <h3 className="text-base font-semibold text-gray-800 flex flex-wrap items-center gap-2 md:gap-3">
              روابط التواصل الاجتماعي
            </h3>
            <button
              onClick={() => {
                const newId =
                  localSocialLinks.length > 0
                    ? Math.max(...localSocialLinks.map((l: any) => l.id)) + 1
                    : 1;
                setLocalSocialLinks([
                  ...localSocialLinks,
                  { id: newId, platform: "", url: "", icon: "Link", visible: true },
                ]);
              }}
              className="p-2 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 transition-all cursor-pointer"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            {localSocialLinks.map((link: any, index: number) => (
              <div key={link.id} className="p-4 bg-white/50 rounded-xl border border-gray-150 space-y-4 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl border border-gray-150 flex items-center justify-center text-primary shrink-0">
                      {link.platform === "facebook" && <Facebook size={18} />}
                      {link.platform === "instagram" && <Instagram size={18} />}
                      {link.platform === "whatsapp" && <WhatsAppIcon size={18} />}
                      {link.platform === "twitter" && <Twitter size={18} />}
                      {!["facebook", "instagram", "whatsapp", "twitter"].includes(link.platform) && <Globe size={18} />}
                    </div>
                    <span className="font-medium text-gray-800 capitalize">{link.platform || "منصة جديدة"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const newLinks = [...localSocialLinks];
                        newLinks[index].visible = !newLinks[index].visible;
                        setLocalSocialLinks(newLinks);
                      }}
                      className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                        link.visible
                          ? "bg-primary-light text-primary"
                          : "bg-gray-100 text-gray-400"
                      }`}
                      title={link.visible ? "إخفاء" : "إظهار"}
                    >
                      {link.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => {
                        setLocalSocialLinks(localSocialLinks.filter((l: any) => l.id !== link.id));
                      }}
                      className="p-1.5 bg-primary-light text-primary rounded-xl hover:bg-primary-soft-border transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">المنصة</label>
                    <select
                      value={link.platform}
                      onChange={(e) => {
                        const newLinks = [...localSocialLinks];
                        newLinks[index].platform = e.target.value;
                        setLocalSocialLinks(newLinks);
                      }}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-all cursor-pointer"
                    >
                      <option value="">اختر المنصة</option>
                      <option value="facebook">فيسبوك</option>
                      <option value="instagram">إنستجرام</option>
                      <option value="whatsapp">واتساب</option>
                      <option value="twitter">تويتر</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">الرابط (URL)</label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...localSocialLinks];
                        newLinks[index].url = e.target.value;
                        setLocalSocialLinks(newLinks);
                      }}

                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-all text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            ))}
            {localSocialLinks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 shrink-0">
                  <Globe size={24} />
                </div>
                <p className="text-gray-400 font-medium text-sm">لا توجد روابط تواصل اجتماعي مضافة</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-150 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100 bg-white">
              <h3 className="text-base font-semibold text-gray-800 flex flex-wrap items-center gap-2 md:gap-3">
                معلومات التواصل الأساسية
              </h3>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Numbers Section */}
                <div className="space-y-4 sm:col-span-2">
                  {/* Primary WhatsApp Booking Number */}
                  <div className="bg-primary-light border border-primary/25 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-primary-dark">
                      <WhatsAppIcon size={18} />
                      <span className="font-semibold text-sm">رقم الحجز الأساسي (واتساب)</span>
                    </div>
                    <p className="text-xs text-primary leading-relaxed font-medium">
                      سيتم توجيه جميع طلبات الحجز ونقرات واتساب عبر الموقع بالكامل إلى هذا الرقم تلقائياً، دون الحاجة لتعديل الكود.
                    </p>
                    <div className="relative">
                      <input
                        type="text"
                        value={Array.isArray(localContactInfo.phones) && localContactInfo.phones[0] ? localContactInfo.phones[0] : ""}
                        onChange={(e) => {
                          const currentPhones = [...(localContactInfo.phones || [])];
                          if (currentPhones.length === 0) {
                            currentPhones.push(e.target.value);
                          } else {
                            currentPhones[0] = e.target.value;
                          }
                          setLocalContactInfo({ ...localContactInfo, phones: currentPhones });
                        }}

                        className="w-full bg-white border border-primary-soft-border focus:border-primary rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 outline-none transition-all text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Additional Phone Numbers */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">أرقام الهواتف الإضافية للتواصل</label>
                      <button
                        onClick={() => {
                          const currentPhones = [...(localContactInfo.phones || [])];
                          if (currentPhones.length === 0) {
                            currentPhones.push("", ""); // first is primary, second is additional
                          } else {
                            currentPhones.push("");
                          }
                          setLocalContactInfo({ ...localContactInfo, phones: currentPhones });
                        }}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        + إضافة رقم إضافي
                      </button>
                    </div>

                    {Array.isArray(localContactInfo.phones) && localContactInfo.phones.slice(1).map((phone: string, index: number) => (
                      <div key={`additional-phone-${index}`} className="flex gap-2">
                        <input
                          type="text"
                          value={phone}

                          onChange={(e) => {
                            const currentPhones = [...(localContactInfo.phones || [])];
                            currentPhones[index + 1] = e.target.value;
                            setLocalContactInfo({ ...localContactInfo, phones: currentPhones });
                          }}
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-all text-left"
                          dir="ltr"
                        />
                        <button
                          onClick={() => {
                            const currentPhones = [...(localContactInfo.phones || [])];
                            currentPhones.splice(index + 1, 1);
                            setLocalContactInfo({ ...localContactInfo, phones: currentPhones });
                          }}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light rounded-xl transition-all cursor-pointer"
                          title="حذف الرقم"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    {(!Array.isArray(localContactInfo.phones) || localContactInfo.phones.length <= 1) && (
                      <p className="text-3xs text-gray-400">لا توجد أرقام هواتف إضافية مضافة.</p>
                    )}
                  </div>
                </div>

                {/* Email Column (Half-width on SM+) */}
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={localContactInfo.email || ""}
                    onChange={(e) => setLocalContactInfo({ ...localContactInfo, email: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-all text-left"
                    dir="ltr"
                  />
                </div>

                {/* Address Column (Full-width) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">العنوان (نصي)</label>
                  <textarea
                    value={localContactInfo.address || ""}
                    onChange={(e) => setLocalContactInfo({ ...localContactInfo, address: e.target.value })}
                    rows={3}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-all resize-none"
                  />
                </div>

                {/* Map URL Column (Full-width) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">رابط خريطة جوجل (Google Maps Embed URL)</label>
                  <input
                    type="url"
                    value={localContactInfo.addressUrl || ""}
                    onChange={(e) => setLocalContactInfo({ ...localContactInfo, addressUrl: e.target.value })}

                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-all text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSaveSettings}
          className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 text-sm cursor-pointer"
        >
          <CheckCircle size={16} />
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
});
