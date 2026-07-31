import { parseStringArray } from "../lib/utils";
import { Logo } from "../components/ui";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Booking } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  normalizeAndStemText,
  matchesBooking,
  matchesOffer,
  matchesVisa,
  matchesDestination,
} from "../lib/searchUtils";
import {
  FileText,
  Briefcase,
  Calendar,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Plus,
  Trash2,
  Search,
  MapPin,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Home,
  RefreshCw,
  Settings,
  Bell,
} from "lucide-react";
import { apiService } from "../lib/apiService";
import { parsePhones } from "../lib/utils";
import { serviceTranslations } from "../lib/dashboardUtils";
import {
  StatBox,
  OverviewTab,
  SubscribersTab,
  SettingsTab,
  BookingDetailsModal,
  ItemFormModal,
  OffersTab,
  VisasTab,
  DestinationsTab,
  BookingsTab,
  GlobalSearchResults,
} from "../components/dashboard";



export function DashboardPage({
  onLogout,
  onNavigate,
  offers,
  destinations,
  bookings,
  visas,
  socialLinks,
  contactInfo,
  onRefresh,
}: {
  onLogout: () => void;
  onNavigate: (page: string) => void;
  offers: any[];
  destinations: any[];
  bookings: any[];
  visas: any[];
  socialLinks: any[];
  contactInfo: any;
  onRefresh?: () => Promise<void>;
}) {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeTab === "subscribers") {
      apiService
        .getSubscribers()
        .then((data) => setSubscribers(data || []))
        .catch((err) => console.error(err));
    }
  }, [activeTab]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [viewBooking, setViewBooking] = useState<any>(null);
  const [isFetchingBookingDetails, setIsFetchingBookingDetails] =
    useState<boolean>(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Desktop/Computer Keyboard Shortcuts for professional power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if the user is typing in an input, textarea, or select
      const activeElement = document.activeElement;
      const isInput =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          (activeElement as HTMLElement).isContentEditable);

      // ESC to close any modal, or clear search if focused
      if (e.key === "Escape") {
        if (isModalOpen) {
          setIsModalOpen(false);
          setEditingItem(null);
        } else if (viewBooking) {
          setViewBooking(null);
        } else if (searchQuery) {
          setSearchQuery("");
        }
        return;
      }

      if (isInput) return;

      // Focus search input: press '/' or 'Ctrl+F'
      if (e.key === "/" || (e.ctrlKey && e.key === "f")) {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="بحث"]',
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Quick Tab Switching: Alt + [1-7]
      if (e.altKey && ["1", "2", "3", "4", "5", "6", "7"].includes(e.key)) {
        e.preventDefault();
        const tabs = [
          "overview",
          "bookings",
          "offers",
          "visas",
          "destinations",
          "subscribers",
          "settings",
        ];
        const index = parseInt(e.key) - 1;
        if (index >= 0 && index < tabs.length) {
          setActiveTab(tabs[index]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, viewBooking, searchQuery]);

  const [localSocialLinks, setLocalSocialLinks] = useState<any[]>(
    Array.isArray(socialLinks) ? socialLinks : [],
  );
  const [localContactInfo, setLocalContactInfo] = useState<any>(
    contactInfo && typeof contactInfo === "object"
      ? {
          ...contactInfo,
          phones: parsePhones(contactInfo.phones),
        }
      : { phones: [], email: "", address: "", addressUrl: "" },
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (socialLinks && Array.isArray(socialLinks)) {
        setLocalSocialLinks(socialLinks);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [socialLinks]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (contactInfo) {
        const phones = parsePhones(contactInfo.phones);
        setLocalContactInfo({ ...contactInfo, phones });
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [contactInfo]);

  const handleSaveSettings = async () => {
    try {
      await Promise.all([
        apiService.updateSocialLinks(localSocialLinks),
        apiService.updateContactInfo(localContactInfo),
      ]);
      if (onRefresh) await onRefresh();
      showToast("تم حفظ الإعدادات بنجاح");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      showToast(`حدث خطأ أثناء حفظ الإعدادات: ${error.message || ""}`, "error");
    }
  };

  const showToast = useCallback((
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (editingItem) {
        setFormData(editingItem);
      } else {
        setFormData({});
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [editingItem]);

  const [statusFilter, setStatusFilter] = useState("الكل");
  const [serviceFilter, setServiceFilter] = useState("الكل");
  const [offerStatusFilter, setOfferStatusFilter] = useState("الكل");
  const [visaStatusFilter, setVisaStatusFilter] = useState("الكل");

  const filteredOffers = useMemo(() => {
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return offers.filter((offer) => {
      const matchesSearch = matchesOffer(offer, terms);
      const matchesStatus =
        offerStatusFilter === "الكل" || offer.status === offerStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [offers, searchQuery, offerStatusFilter]);

  const filteredVisas = useMemo(() => {
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return visas.filter((visa) => {
      const matchesSearch = matchesVisa(visa, terms);
      const matchesStatus =
        visaStatusFilter === "الكل" || visa.status === visaStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [visas, searchQuery, visaStatusFilter]);

  const filteredDestinations = useMemo(() => {
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return destinations.filter((dest) => {
      return matchesDestination(dest, terms);
    });
  }, [destinations, searchQuery]);

  const filteredBookings = useMemo(() => {
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return bookings.filter((booking) => {
      const matchesSearch = matchesBooking(booking, terms);
      const matchesStatus =
        statusFilter === "الكل" || booking.status === statusFilter;
      const matchesService =
        serviceFilter === "الكل" ||
        booking.serviceType === serviceFilter ||
        booking.service === serviceFilter;
      return matchesSearch && matchesStatus && matchesService;
    });
  }, [bookings, searchQuery, statusFilter, serviceFilter]);

  const filteredSubscribers = useMemo(() => {
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return subscribers.filter((sub) => {
      const stemmedQueryTerms = terms.map(normalizeAndStemText).filter(Boolean);
      if (stemmedQueryTerms.length === 0) return true;

      const searchContent = [
        sub.name,
        sub.phone,
        sub.created_at
          ? new Date(sub.created_at).toLocaleDateString("ar-EG")
          : "",
      ]
        .map((val) => (val ? String(val) : ""))
        .join(" ");

      const stemmedContent = normalizeAndStemText(searchContent);
      return stemmedQueryTerms.every((term) => stemmedContent.includes(term));
    });
  }, [subscribers, searchQuery]);

  // Dynamically extract categories from offers for filtering
  // Dynamically extract service types from bookings for filtering
  const bookingServices = useMemo(() => {
    const services = new Set<string>();
    bookings.forEach((b) => {
      const type = b.serviceType || b.service;
      if (type) services.add(type);
    });
    return ["الكل", ...Array.from(services)];
  }, [bookings]);

  const searchCounts = useMemo(() => {
    if (!searchQuery.trim()) return {} as Record<string, number>;
    return {
      bookings: filteredBookings.length,
      offers: filteredOffers.length,
      visas: filteredVisas.length,
      destinations: filteredDestinations.length,
      subscribers: filteredSubscribers.length,
    } as Record<string, number>;
  }, [
    searchQuery,
    filteredBookings,
    filteredOffers,
    filteredVisas,
    filteredDestinations,
    filteredSubscribers,
  ]);

  const handleDeleteItem = useCallback((
    id: number | string,
    message: string,
    apiMethod: (id: number | string) => Promise<any>,
    itemName: string,
  ) => {
    setConfirmModal({
      message,
      onConfirm: async () => {
        try {
          await apiMethod(id);
          if (onRefresh) await onRefresh();
          showToast(`تم حذف ${itemName} بنجاح`);
        } catch (error: any) {
          console.error(`Error deleting ${itemName}:`, error);
          showToast(
            `حدث خطأ أثناء حذف ${itemName}: ${error.message || ""}`,
            "error",
          );
        }
        setConfirmModal(null);
      },
    });
  }, [onRefresh, showToast]);

  const handleDeleteOffer = useCallback((id: number) =>
    handleDeleteItem(
      id,
      "هل أنت متأكد من حذف هذا العرض؟ سيؤدي هذا إلى إزالته نهائياً من الموقع.",
      apiService.deleteOffer,
      "العرض",
    ), [handleDeleteItem]);
  const handleDeleteDestination = useCallback((id: number) =>
    handleDeleteItem(
      id,
      "هل أنت متأكد من حذف هذه الوجهة؟ قد يؤثر ذلك على العروض المرتبطة بها.",
      apiService.deleteDestination,
      "الوجهة",
    ), [handleDeleteItem]);
  const handleDeleteVisa = useCallback((id: number) =>
    handleDeleteItem(
      id,
      "هل أنت متأكد من حذف هذه التأشيرة؟ سيؤدي هذا إلى إزالتها نهائياً من الموقع.",
      apiService.deleteVisa,
      "التأشيرة",
    ), [handleDeleteItem]);
  const handleDeleteBooking = useCallback((id: string | number) =>
    handleDeleteItem(
      id,
      "هل أنت متأكد من حذف هذا الحجز؟ سيؤدي هذا إلى إزالته نهائياً.",
      apiService.deleteBooking,
      "الحجز",
    ), [handleDeleteItem]);

  const handleViewBookingDetails = useCallback(async (booking: Booking | any) => {
    setViewBooking(booking);
    setIsFetchingBookingDetails(true);
    try {
      const fullBooking = await apiService.getBooking(booking.id);
      setViewBooking((prev: any) => ({ ...prev, ...fullBooking }));
    } catch (e: any) {
      console.error(e);
      showToast(
        `تعذر تحميل تفاصيل الحجز كاملة: ${e.message || "خطأ غير معروف"}`,
        "error",
      );
    } finally {
      setIsFetchingBookingDetails(false);
    }
  }, [showToast]);

  const handleUpdateBookingStatus = useCallback(async (
    id: string | number,
    newStatus: string,
  ) => {
    try {
      await apiService.updateBookingStatus(id, newStatus);
      if (onRefresh) await onRefresh();
      showToast(`تم تحديث حالة الحجز إلى ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      showToast(
        `حدث خطأ أثناء تحديث حالة الحجز: ${error.message || ""}`,
        "error",
      );
    }
  }, [onRefresh, showToast]);

  const handleMoveItem = useCallback(async (
    type: "offers" | "visas" | "destinations",
    id: any,
    direction: "up" | "down",
  ) => {
    const list =
      type === "offers" ? offers : type === "visas" ? visas : destinations;
    const currentIndex = list.findIndex((item) => item.id === id);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const newList = [...list];
    // Swap positions
    [newList[currentIndex], newList[targetIndex]] = [
      newList[targetIndex],
      newList[currentIndex],
    ];

    // Map to new sort_orders (simple: use index)
    const reorderedItems = newList.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));

    try {
      showToast("جاري ترتيب العناصر...");
      await apiService.updateSortOrder(type, reorderedItems);
      if (onRefresh) await onRefresh();
      showToast("تم تحديث الترتيب بنجاح");
    } catch (error: any) {
      console.error("Error reordering:", error);
      showToast("حدث خطأ أثناء إعادة الترتيب", "error");
    }
  }, [offers, visas, destinations, onRefresh, showToast]);

  const handleDuplicateItem = async (
    item: any,
    apiMethod: (data: any) => Promise<any>,
    itemName: string,
  ) => {
    try {
      const itemWithoutId = { ...item };
      delete itemWithoutId.id;
      const newItemData = {
        ...itemWithoutId,
        title: `${item.title} (نسخة)`,
      };
      await apiMethod(newItemData);
      if (onRefresh) await onRefresh();
      showToast(`تم تكرار ${itemName} بنجاح`);
    } catch (error) {
      console.error(`Error duplicating ${itemName}:`, error);
      showToast(`حدث خطأ أثناء تكرار ${itemName}`, "error");
    }
  };

  const handleDuplicateOffer = (offer: any) =>
    handleDuplicateItem(offer, apiService.addOffer, "العرض");
  const handleDuplicateVisa = (visa: any) =>
    handleDuplicateItem(visa, apiService.addVisa, "التأشيرة");

  const pendingBookingsCount = useMemo(() => {
    return bookings.filter((b) => b.status === "قيد الانتظار").length;
  }, [bookings]);

  //   if (activeTab === 'offers') {
  //     if (!formData.image) {
  //       showToast('يرجى إضافة صورة للعرض', 'error');
  //       return;
  //     }
  //     ...
  //   }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (activeTab === "offers") {
        if (!formData.title) {
          showToast("يرجى إدخال عنوان العرض", "error");
          return;
        }
        if (!formData.image) {
          showToast("يرجى إضافة صورة للعرض", "error");
          return;
        }
        if (!formData.price) {
          showToast("يرجى إدخال السعر", "error");
          return;
        }
        const offerData = { ...formData };
        if (editingItem) {
          await apiService.updateOffer({ ...offerData, id: editingItem.id });
          showToast("تم تحديث العرض بنجاح");
        } else {
          await apiService.addOffer({ ...offerData, id: Date.now() });
          showToast("تمت إضافة العرض بنجاح");
        }
      } else if (activeTab === "destinations") {
        if (!formData.name) {
          showToast("يرجى إدخال اسم الوجهة", "error");
          return;
        }
        if (!formData.image) {
          showToast("يرجى إضافة صورة للوجهة", "error");
          return;
        }
        const destData = {
          name: formData.name,
          image: formData.image,
          category: formData.category,
          description: formData.description,
        };
        if (editingItem) {
          await apiService.updateDestination({
            ...destData,
            id: editingItem.id,
          });
          showToast("تم تحديث الوجهة بنجاح");
        } else {
          await apiService.addDestination({ ...destData, id: Date.now() });
          showToast("تمت إضافة الوجهة بنجاح");
        }
      } else if (activeTab === "visas") {
        if (!formData.title) {
          showToast("يرجى إدخال اسم التأشيرة", "error");
          return;
        }
        if (!formData.price) {
          showToast("يرجى إدخال سعر التأشيرة", "error");
          return;
        }
        const features = parseStringArray(formData.features);
        const visaData = { ...formData, features };
        if (editingItem) {
          await apiService.updateVisa({ ...visaData, id: editingItem.id });
          showToast("تم تحديث التأشيرة بنجاح");
        } else {
          await apiService.addVisa({ ...visaData, id: Date.now() });
          showToast("تمت إضافة التأشيرة بنجاح");
        }
      }
      if (onRefresh) await onRefresh();
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({});
    } catch (error: any) {
      console.error("Error saving item:", error);
      showToast(`حدث خطأ أثناء الحفظ: ${error.message || ""}`, "error");
    }
  };

  const menuItems = [
    {
      id: "overview",
      label: "نظرة عامة",
      icon: <LayoutDashboard size={20} />,
      color: "primary",
      desc: "إحصائيات عامة",
    },
    {
      id: "bookings",
      label: "الحجوزات",
      icon: <FileText size={20} />,
      color: "primary",
      desc: "إدارة طلبات العملاء",
    },
    {
      id: "offers",
      label: "العروض",
      icon: <Briefcase size={20} />,
      color: "primary",
      desc: "إدارة عروض الرحلات",
    },
    {
      id: "visas",
      label: "التأشيرات",
      icon: <ShieldCheck size={20} />,
      color: "primary",
      desc: "إدارة خدمات التأشيرات",
    },
    {
      id: "destinations",
      label: "الوجهات",
      icon: <MapPin size={20} />,
      color: "primary",
      desc: "إدارة الوجهات السياحية",
    },
    {
      id: "subscribers",
      label: "المشتركون",
      icon: <Bell size={20} />,
      color: "primary",
      desc: "تنبيهات واتساب",
    },
    {
      id: "settings",
      label: "الإعدادات",
      icon: <Settings size={20} />,
      color: "primary",
      desc: "إدارة معلومات التواصل",
    },
  ];

  return (
    <div
      className="min-h-[100dvh] bg-white flex overflow-hidden"
      dir="rtl"
    >
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 w-64 lg:w-64 bg-white border-l border-gray-150 z-50 flex flex-col h-full transition-all duration-300 ease-in-out ${isSidebarOpen ? "right-0" : "-right-64 lg:right-0"}`}
      >
        <div className="p-6 border-b border-gray-150 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-gray-150 shrink-0">
              <Logo size={40} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-semibold text-gray-800 leading-tight">
                صابرينكو <span className="text-primary">سياحة</span>
              </span>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                لوحة التحكم
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
          {menuItems.map((item) => {
            const hasMatch =
              searchQuery.trim() !== "" && searchCounts[item.id] !== undefined;
            const matchCount = hasMatch ? searchCounts[item.id] : 0;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative ${
                  activeTab === item.id
                    ? "bg-primary/5 text-primary"
                    : "text-gray-600 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {hasMatch && (
                  <span
                    className={`mr-auto px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                      matchCount > 0
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {matchCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-150 bg-white space-y-2 shrink-0">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-all"
          >
            <Home size={18} />
            العودة للموقع
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-sm text-primary hover:bg-primary/5 transition-all"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-150 p-4 md:px-8 sticky top-0 z-30 flex items-center justify-center">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:bg-primary/5 hover:text-primary hover:border-primary/20 rounded-xl transition-all border border-gray-200 shrink-0"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-xl font-semibold text-gray-800 leading-none truncate">
                  {menuItems.find((m) => m.id === activeTab)?.label}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={async () => {
                  if (onRefresh) {
                    showToast("جاري تحديث البيانات...");
                    try {
                      await onRefresh();
                      showToast("تم تحديث البيانات بنجاح");
                    } catch {
                      showToast("فشل تحديث البيانات", "error");
                    }
                  }
                }}
                className="p-2 text-gray-500 hover:bg-primary/5 hover:text-primary rounded-xl transition-all shrink-0 cursor-pointer"
                title="تحديث البيانات"
              >
                <RefreshCw size={18} />
              </button>
              <div className="relative hidden lg:block group flex-1 max-w-xs">
                <Search
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                />
                <input
                  type="text"

                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-8 py-2 text-sm font-medium text-gray-800 focus:bg-white focus:outline-none focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                    title="مسح البحث"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {["offers", "visas", "destinations"].includes(activeTab) && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">إضافة جديد</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar no-print pb-24">
          <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            {activeTab !== "settings" && (
              <div className="relative lg:hidden mb-6 group">
                <Search
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                />
                <input
                  type="text"

                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-8 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    title="مسح البحث"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
            {searchQuery.trim() !== "" && activeTab !== "overview" && (
              <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span>
                    نتائج البحث عن <strong className="text-primary">"{searchQuery}"</strong> ({filteredBookings.length + filteredOffers.length + filteredVisas.length + filteredDestinations.length + filteredSubscribers.length} نتيجة)
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("overview")}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  عرض النتائج الشاملة
                </button>
              </div>
            )}
            {activeTab === "overview" ? (
              searchQuery.trim() !== "" ? (
                <GlobalSearchResults
                  searchQuery={searchQuery}
                  filteredBookings={filteredBookings}
                  filteredOffers={filteredOffers}
                  filteredVisas={filteredVisas}
                  filteredDestinations={filteredDestinations}
                  filteredSubscribers={filteredSubscribers}
                  setActiveTab={setActiveTab}
                  setEditingItem={setEditingItem}
                  setIsModalOpen={setIsModalOpen}
                  handleViewBookingDetails={handleViewBookingDetails}
                  handleDeleteBooking={handleDeleteBooking}
                  handleDeleteOffer={handleDeleteOffer}
                  handleDeleteVisa={handleDeleteVisa}
                  handleDeleteDestination={handleDeleteDestination}
                  serviceTranslations={serviceTranslations}
                  onClearSearch={() => setSearchQuery("")}
                />
              ) : (
                <OverviewTab
                  offers={offers}
                  visas={visas}
                  destinations={destinations}
                  bookings={bookings}
                  socialLinks={socialLinks}
                  pendingBookingsCount={pendingBookingsCount}
                  setActiveTab={setActiveTab}
                  setEditingItem={setEditingItem}
                  setIsModalOpen={setIsModalOpen}
                />
              )
            ) : activeTab === "subscribers" ? (
              <SubscribersTab
                subscribers={subscribers}
                filteredSubscribers={filteredSubscribers}
                searchQuery={searchQuery}
                setSubscribers={setSubscribers}
                setConfirmModal={setConfirmModal}
                showToast={showToast}
              />
            ) : activeTab === "settings" ? (
              <SettingsTab
                localSocialLinks={localSocialLinks}
                setLocalSocialLinks={setLocalSocialLinks}
                localContactInfo={localContactInfo}
                setLocalContactInfo={setLocalContactInfo}
                handleSaveSettings={handleSaveSettings}
              />
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Stats Grid for other tabs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      icon: <Briefcase size={20} />,
                      label: "إجمالي العروض",
                      value: offers.length,
                    },
                    {
                      icon: <ShieldCheck size={20} />,
                      label: "إجمالي التأشيرات",
                      value: visas.length,
                    },
                    {
                      icon: <MapPin size={20} />,
                      label: "إجمالي الوجهات",
                      value: destinations.length,
                    },
                    {
                      icon: <Calendar size={20} />,
                      label: "إجمالي الحجوزات",
                      value: bookings.length,
                    },
                  ].map((stat, i) => (
                    <StatBox
                      key={i}
                      icon={stat.icon}
                      label={stat.label}
                      value={stat.value}
                      bgClass="bg-primary/5"
                      textClass="text-primary"
                    />
                  ))}
                </div>

                <div className="bg-transparent border-none md:bg-white md:rounded-xl md:border md:border-gray-150 md:overflow-hidden">
                  {activeTab === "offers" && (
                    <OffersTab
                      filteredOffers={filteredOffers}
                      searchQuery={searchQuery}
                      offerStatusFilter={offerStatusFilter}
                      setOfferStatusFilter={setOfferStatusFilter}
                      handleMoveItem={handleMoveItem}
                      handleDuplicateOffer={handleDuplicateOffer}
                      setEditingItem={setEditingItem}
                      setIsModalOpen={setIsModalOpen}
                      handleDeleteOffer={handleDeleteOffer}
                    />
                  )}

                  {activeTab === "visas" && (
                    <VisasTab
                      filteredVisas={filteredVisas}
                      searchQuery={searchQuery}
                      visaStatusFilter={visaStatusFilter}
                      setVisaStatusFilter={setVisaStatusFilter}
                      handleMoveItem={handleMoveItem}
                      handleDuplicateVisa={handleDuplicateVisa}
                      setEditingItem={setEditingItem}
                      setIsModalOpen={setIsModalOpen}
                      handleDeleteVisa={handleDeleteVisa}
                    />
                  )}

                  {activeTab === "destinations" && (
                    <DestinationsTab
                      filteredDestinations={filteredDestinations}
                      searchQuery={searchQuery}
                      handleMoveItem={handleMoveItem}
                      setEditingItem={setEditingItem}
                      setIsModalOpen={setIsModalOpen}
                      handleDeleteDestination={handleDeleteDestination}
                    />
                  )}

                  {activeTab === "bookings" && (
                    <BookingsTab
                      filteredBookings={filteredBookings}
                      searchQuery={searchQuery}
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      serviceFilter={serviceFilter}
                      setServiceFilter={setServiceFilter}
                      bookingServices={bookingServices}
                      serviceTranslations={serviceTranslations}
                      handleUpdateBookingStatus={handleUpdateBookingStatus}
                      handleViewBookingDetails={handleViewBookingDetails}
                      handleDeleteBooking={handleDeleteBooking}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* View Booking Modal - Simple Version */}
      <BookingDetailsModal
        viewBooking={viewBooking}
        setViewBooking={setViewBooking}
        isFetchingBookingDetails={isFetchingBookingDetails}
        handleUpdateBookingStatus={handleUpdateBookingStatus}
        showToast={showToast}
      />

      {/* Item Form Modal */}
      <ItemFormModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        activeTab={activeTab}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        showToast={showToast}
      />

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[250] flex items-center justify-center p-4"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl w-full max-w-sm overflow-hidden border border-gray-150 shadow-xl"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    تأكيد الحذف
                  </h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-3 bg-white">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-2 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-white transition-all cursor-pointer text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-2 rounded-xl font-semibold text-white bg-primary hover:bg-primary-hover transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Trash2 size={16} />
                  حذف
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 40, x: "-50%" }}
            className={`fixed bottom-8 left-1/2 px-4 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-3 z-[400] w-auto max-w-sm justify-center shadow-lg ${
              toast.type === "success"
                ? "bg-primary"
                : "bg-primary"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
