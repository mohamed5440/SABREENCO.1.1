import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, Send, AlertCircle } from "lucide-react";
import { apiService } from "../../lib/apiService";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await apiService.signIn(email, password);
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      if (
        err.message === "Invalid login credentials" ||
        err.message === "Invalid credentials"
      ) {
        setError(
          "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من بيانات الاعتماد.",
        );
      } else {
        setError(
          err.message || "حدث خطأ أثناء العملية. يرجى المحاولة مرة أخرى.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset to login state when closed
      setTimeout(() => {
        setError("");
      }, 300);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md z-[150] flex items-center justify-center p-3 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 25 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white rounded-xl w-full max-w-md border-2 border-gray-200 relative z-10 overflow-hidden flex flex-col max-h-[90dvh]"
            dir="rtl"
          >
            <button
              onClick={onClose}
              className="absolute left-4 top-4 p-2 bg-white hover:bg-primary-light hover:text-primary rounded-xl transition-all hover:rotate-90 text-gray-500 border border-gray-200 hover:border-primary-soft-border z-20 cursor-pointer"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>

            {/* Content area */}
            <div className="overflow-y-auto custom-scrollbar p-6 sm:p-8 md:p-10 flex-1">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-10 blur-2xl pointer-events-none"></div>

              <div className="mb-6 sm:mb-8 pr-2">
                <div className="relative">
                  <div className="w-12 h-14 sm:w-16 sm:h-16 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-4 sm:mb-6 border border-primary/20 shrink-0">
                    <Lock
                      size={22}
                      className="sm:w-[28px] sm:h-[28px]"
                      strokeWidth={2.5}
                    />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-800 leading-tight">
                    تسجيل دخول الإدارة
                  </h2>
                  <p className="text-gray-500 mt-2 sm:mt-3 text-xs sm:text-sm font-semibold leading-[1.6]">
                    يرجى إدخال البريد الإلكتروني وكلمة المرور للولوج إلى لوحة التحكم بصلاحيات كاملة.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-primary-light border border-primary-soft-border rounded-xl text-primary flex items-start gap-3 text-sm font-semibold leading-relaxed">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2 text-right">
                  <label className="block text-xs font-bold text-gray-800 opacity-80 pr-1">
                    البريد الإلكتروني للإدارة
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 h-14 text-sm md:text-base text-gray-800 font-semibold focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-left"

                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="block text-xs font-bold text-gray-800 opacity-80 pr-1">
                    كلمة المرور المشفرة
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-mono">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 h-14 text-sm md:text-base text-gray-800 font-semibold focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-left tracking-widest"

                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-hover text-white h-14 rounded-xl font-bold text-base transition-all duration-300 active:scale-95 select-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={18} />
                      دخول لوحة التحكم
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
