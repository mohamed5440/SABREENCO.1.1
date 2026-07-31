import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Plane,
  Building,
  MapPin,
  Gift,
  ShieldCheck,
  Menu,
  X,
  Info,
  Headset,
  ArrowUpRight,
  LayoutGrid,
} from "lucide-react";
import { SocialLinks, Logo } from "../ui";

interface HeaderProps {
  onNavigate: (page: string, service?: string, context?: any) => void;
  currentPage: string;
  isLoggedIn: boolean;
  socialLinks?: any[];
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentPage,
  isLoggedIn,
  socialLinks = [],
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let lastScrolled = false;
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== lastScrolled) {
        lastScrolled = scrolled;
        setIsScrolled(scrolled);
      }
    };
    // Initialize state on mount
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", id: "home", icon: Home },
    { name: "الطيران", id: "flights", icon: Plane },
    { name: "الفنادق", id: "hotels", icon: Building },
    { name: "الوجهات", id: "destinations", icon: MapPin },
    { name: "العروض", id: "offers", icon: Gift },
    { name: "التأشيرات", id: "visa", icon: ShieldCheck },
    { name: "تواصل معنا", id: "contact", icon: Headset },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-200 py-3"
            : "bg-white/70 backdrop-blur-md border-b border-transparent py-4 md:py-6"
        }`}
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group min-w-0"
            onClick={() => onNavigate("home")}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white rounded-xl sm:rounded-xl flex items-center justify-center overflow-hidden transition-all border border-gray-200 shrink-0 group-hover:border-primary/30">
              <Logo size={100} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm min-[360px]:text-base sm:text-xl md:text-2xl font-bold text-gray-800 leading-tight tracking-tight truncate">
                صابرينكو <span className="text-primary">للخدمات السياحية</span>
              </span>
              <span className="label-caps !text-[8px] min-[360px]:!text-[10px] sm:!text-xs md:!text-sm text-gray-500 tracking-[0.1em] sm:tracking-[0.2em] leading-none mt-1 sm:mt-1.5">
                رحلتك تبدأ هنا
              </span>
            </div>
          </motion.div>

          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${
                  currentPage === link.id
                    ? "bg-primary-light text-primary"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <button
                onClick={() => onNavigate("dashboard")}
                className="hidden lg:flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-primary text-white hover:bg-primary-hover active:scale-95 whitespace-nowrap shrink-0"
              >
                <LayoutGrid size={18} />
                <span className="leading-none">لوحة التحكم</span>
              </button>
            )}
            <button
              aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              className="lg:hidden p-2.5 rounded-xl transition-all text-gray-800 hover:bg-gray-200 active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-muted-dark/60 backdrop-blur-md z-[150] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 h-[100dvh] w-[85vw] max-w-[340px] bg-white z-[160] lg:hidden flex flex-col border-l border-gray-200 pb-[env(safe-area-inset-bottom)]"
              dir="rtl"
            >
              {/* Mobile Menu Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white/25 backdrop-blur-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                    <Logo size={48} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-800 leading-tight">
                      صابرينكو{" "}
                      <span className="text-primary">للخدمات السياحية</span>
                    </span>
                    <span className="label-caps !text-xs mt-1 tracking-[0.1em]">
                      رحلتك تبدأ هنا
                    </span>
                  </div>
                </div>
                <button
                  aria-label="إغلاق القائمة"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-all active:scale-95 border border-transparent"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main Navigation */}
              <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                <div className="px-2 mb-4">
                  <p className="label-caps mb-4 opacity-70">القائمة الرئيسية</p>
                </div>
                <div className="space-y-1.5">
                  {navLinks
                    .filter((l) => l.id !== "contact")
                    .map((link, idx) => (
                      <motion.button
                        key={link.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        onClick={() => {
                          onNavigate(link.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-all active:scale-95 group relative overflow-hidden ${
                          currentPage === link.id
                            ? "bg-primary text-white "
                            : "bg-white text-gray-800 hover:bg-primary-light hover:text-primary border border-transparent hover:border-primary/20"
                        }`}
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              currentPage === link.id
                                ? "bg-white/20 text-white"
                                : "bg-white text-gray-500 group-hover:text-primary "
                            } shrink-0`}
                          >
                            <link.icon
                              size={20}
                              strokeWidth={currentPage === link.id ? 2.5 : 2}
                            />
                          </div>
                          <span className="tracking-normal">{link.name}</span>
                        </div>
                        {currentPage === link.id && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 bg-gradient-to-r from-primary to-primary-hover"
                          />
                        )}
                        <ArrowUpRight
                          size={16}
                          className={`opacity-0 group-hover:opacity-40 transition-opacity ${currentPage === link.id ? "text-white" : "text-primary"}`}
                        />
                      </motion.button>
                    ))}
                </div>

                {/* Secondary Links Section */}
                <div className="mt-8 px-2">
                  <p className="label-caps mb-4 opacity-70">معلومات إضافية</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        onNavigate("about");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center justify-center gap-2 py-5 bg-white/60 text-gray-800 rounded-xl font-medium text-xs hover:bg-primary-light hover:text-primary transition-all border border-gray-200 hover:border-primary/20 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                        <Info size={20} />
                      </div>
                      من نحن
                    </button>
                    <button
                      onClick={() => {
                        onNavigate("contact");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center justify-center gap-2 py-5 bg-white/60 text-gray-800 rounded-xl font-medium text-xs hover:bg-primary-light hover:text-primary transition-all border border-gray-200 hover:border-primary/20 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                        <Headset size={20} />
                      </div>
                      تواصل معنا
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm space-y-5">
                {isLoggedIn && (
                  <button
                    onClick={() => {
                      onNavigate("dashboard");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-primary text-white py-4 rounded-xl font-medium text-sm flex items-center justify-center gap-3 hover:bg-primary-hover transition-all active:scale-95"
                  >
                    <LayoutGrid size={20} />
                    لوحة التحكم الإدارية
                  </button>
                )}

                <div className="flex flex-col items-center gap-4">
                  <p className="label-caps mb-1 opacity-70">تابعنا على</p>
                  <SocialLinks
                    links={socialLinks}
                    linkClassName="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group"
                    iconSize={20}
                    containerClassName="flex items-center justify-center gap-3"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
