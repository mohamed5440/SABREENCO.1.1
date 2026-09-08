import React from "react";
import { ChevronUp, ChevronDown, Plus, Edit, Trash2, Upload, X, ShieldCheck } from "lucide-react";
import { parseStringArray, optimizeImageUrl, getStatusColor } from "../../lib/utils";
import { HighlightText } from "../ui";

// 1. DashboardTabHeader
interface DashboardTabHeaderProps {
  title: string;
  count: number;
  children?: React.ReactNode;
}

export const DashboardTabHeader: React.FC<DashboardTabHeaderProps> = ({
  title,
  count,
  children,
}) => {
  return (
    <div className="p-4 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
        {title}
      </h3>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 no-print w-full sm:w-auto">
        {children}
        <div className="text-xs font-medium text-gray-500 bg-white border border-gray-100 px-3 py-2 rounded-xl text-center shrink-0">
          {count} سجل متاح
        </div>
      </div>
    </div>
  );
};

// 2. RowActionButtons
interface RowActionButtonsProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const RowActionButtons: React.FC<RowActionButtonsProps> = ({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-end gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
      {onMoveUp && (
        <button
          onClick={onMoveUp}
          className="p-1.5 text-gray-400 hover:text-primary hover:bg-white rounded-xl transition-all active:scale-95 cursor-pointer"
          title="تحريك لأعلى"
        >
          <ChevronUp size={16} />
        </button>
      )}
      {onMoveDown && (
        <button
          onClick={onMoveDown}
          className="p-1.5 text-gray-400 hover:text-primary hover:bg-white rounded-xl transition-all active:scale-95 cursor-pointer"
          title="تحريك لأسفل"
        >
          <ChevronDown size={16} />
        </button>
      )}
      {(onMoveUp || onMoveDown) && <div className="w-px h-3.5 bg-gray-100 mx-1"></div>}
      {onDuplicate && (
        <button
          onClick={onDuplicate}
          className="p-1.5 text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all active:scale-95 cursor-pointer"
          title="تكرار"
        >
          <Plus size={16} />
        </button>
      )}
      <button
        onClick={onEdit}
        className="p-1.5 text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all active:scale-95 cursor-pointer"
        title="تعديل"
      >
        <Edit size={16} />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 text-primary bg-primary-light hover:bg-primary-light/80 rounded-xl transition-all active:scale-95 cursor-pointer"
        title="حذف"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

// 3. StatusBadge
interface StatusBadgeProps {
  status: string;
  activeValue?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  activeValue = "نشط",
  className = "",
}) => {
  const isActive = status === activeValue;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isActive
          ? "bg-primary-light text-primary border-primary-soft-border"
          : "bg-white text-gray-500 border-gray-100"
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-primary" : "bg-gray-400"}`} />
      {status}
    </span>
  );
};

// 4. StatBox
interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgClass?: string;
  textClass?: string;
  onClick?: () => void;
}

export const StatBox: React.FC<StatBoxProps> = ({
  icon,
  label,
  value,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3.5 transition-all duration-200 hover:shadow-sm ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="w-9 h-9 bg-white text-gray-500 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">
          {label}
        </p>
        <h4 className="text-lg font-bold text-gray-800 leading-none">
          {value}
        </h4>
      </div>
    </div>
  );
};

// 5. FeatureListEditor
interface FeatureListEditorProps {
  items: string | string[];
  inputValue: string;
  onInputChange: (val: string) => void;
  onAdd: (e?: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => void;
  onRemove: (idx: number) => void;
  label: string;
  placeholder?: string;
  themeColor?: "success" | "danger" | "primary";
}

export const FeatureListEditor: React.FC<FeatureListEditorProps> = ({
  items,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  label,
  placeholder = "إضافة...",
  themeColor = "primary",
}) => {
  const currentItems = parseStringArray(items);

  const colors = {
    success: {
      dot: "bg-primary",
      tag: "bg-primary-light text-primary border-primary-soft-border",
      border: "focus-within:border-primary",
      iconColor: "text-primary",
      hoverBg: "hover:bg-primary-light",
    },
    danger: {
      dot: "bg-primary",
      tag: "bg-primary-light text-primary-dark border-primary-soft-border",
      border: "focus-within:border-primary",
      iconColor: "text-primary",
      hoverBg: "hover:bg-primary-light",
    },
    primary: {
      dot: "bg-primary",
      tag: "bg-primary/5 text-primary border-primary/10",
      border: "focus-within:border-primary",
      iconColor: "text-primary",
      hoverBg: "hover:bg-primary/5",
    },
  }[themeColor];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd(e);
    }
  };

  return (
    <div className="space-y-2">
      <label className="font-semibold text-gray-700 text-xs flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
        {label}
      </label>
      <div
        className={`bg-white border border-gray-200 rounded-xl p-3.5 ${colors.border} transition-all flex flex-col gap-2`}
      >
        <div className="flex flex-wrap gap-1.5">
          {currentItems.map((item, index) => (
            <div
              key={index}
              className={`${colors.tag} px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 border`}
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="hover:text-primary transition-colors cursor-pointer opacity-75 hover:opacity-100"
                id={`remove-item-${index}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 border-t border-gray-100 pt-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus:outline-none px-1 py-1 text-xs font-medium text-gray-700"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => onAdd()}
            className={`p-1 ${colors.iconColor} ${colors.hoverBg} rounded-xl transition-all cursor-pointer`}
            id="add-item-btn"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// 6. ImageUploader
interface ImageUploaderProps {
  image: string;
  onChange: (url: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  aspectRatioClass?: string;
  maxWidthClass?: string;
  uploadButtonText?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  image,
  onChange,
  onFileUpload,
  label,
  placeholder = "أو أضف رابط الصورة هنا مباشرة",
  aspectRatioClass = "aspect-video md:aspect-[21/9]",
  maxWidthClass = "w-full",
  uploadButtonText = "انقر لرفع صورة جديدة",
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${maxWidthClass} ${className}`}>
      <label className="text-xs font-semibold text-gray-700 block">
        {label}
      </label>
      {image ? (
        <div
          className={`relative ${maxWidthClass} ${aspectRatioClass} rounded-xl overflow-hidden border border-gray-200 group`}
        >
          <img
            decoding="async"
            loading="lazy"
            src={image}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 left-2 p-1.5 bg-primary text-white rounded-xl hover:bg-primary transition-all shadow-sm z-10 flex items-center justify-center cursor-pointer"
            title="إزالة الصورة"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className={`relative group ${maxWidthClass} ${aspectRatioClass}`}>
          <input
            type="file"
            accept="image/*"
            onChange={onFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-full h-full bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/[0.02] transition-all p-4">
            <div className="w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center">
              <Upload size={18} className="text-gray-400" />
            </div>
            <div className="text-center">
              <span className="block font-medium text-gray-700 text-xs mb-0.5">
                {uploadButtonText}
              </span>
              <span className="text-[10px] text-gray-400 block">
                PNG, JPG, WEBP حتى 10 ميجابايت
              </span>
            </div>
          </div>
        </div>
      )}
      <input
        type="url"
        value={image || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:border-primary focus:outline-none text-left"
        dir="ltr"
        placeholder={placeholder}
      />
    </div>
  );
};

// 7. UniversalItemsTable & UniversalItemsMobileCards (Unified Presentational Layer for Lists)
export interface DashboardItem {
  id: any;
  title?: string;
  name?: string; // for destinations
  image?: string;
  price?: any;
  currency?: string;
  duration?: string;
  status?: string;
  category?: string; // for destinations / offers
}

interface UniversalItemsTableProps {
  items: DashboardItem[];
  searchQuery: string;
  itemType: "offers" | "visas" | "destinations";
  defaultCurrency?: string;
  onMoveItem: (type: "offers" | "visas" | "destinations", id: any, direction: "up" | "down") => void;
  onDuplicateItem?: (item: any) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (id: any) => void;
}

export const UniversalItemsTable: React.FC<UniversalItemsTableProps> = React.memo(({
  items,
  searchQuery,
  itemType,
  defaultCurrency = "",
  onMoveItem,
  onDuplicateItem,
  onEditItem,
  onDeleteItem,
}) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-right border-separate border-spacing-0 min-w-[800px]">
        <thead>
          <tr className="bg-white/50">
            <th className="px-5 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider">الاسم - العنوان</th>
            {itemType !== "destinations" && (
              <>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider">السعر</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider">المدة</th>
              </>
            )}
            {itemType === "destinations" && (
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider">التصنيف</th>
            )}
            <th className="px-5 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider text-center">الحالة</th>
            <th className="px-5 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider text-left w-24">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => {
            const title = item.title || item.name || "";
            return (
              <tr key={item.id} className="hover:bg-white/40 transition-all group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img
                          decoding="async"
                          loading="lazy"
                          src={optimizeImageUrl(item.image, 200)}
                          alt={title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ShieldCheck size={20} className="text-gray-300" />
                      )}
                    </div>
                    <span className="font-medium text-gray-700 text-sm tracking-tight line-clamp-2 max-w-xs">
                      <HighlightText text={title} search={searchQuery} />
                    </span>
                  </div>
                </td>
                {itemType !== "destinations" && (
                  <>
                    <td className="px-5 py-4 font-semibold text-primary text-sm">
                      <HighlightText text={String(item.price || "")} search={searchQuery} /> {item.currency || defaultCurrency}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-600 text-xs">
                      <HighlightText text={item.duration || ""} search={searchQuery} />
                    </td>
                  </>
                )}
                {itemType === "destinations" && (
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded-xl bg-primary/5 text-primary text-xs font-medium border border-primary/10">
                      <HighlightText text={item.category || ""} search={searchQuery} />
                    </span>
                  </td>
                )}
                <td className="px-5 py-4 text-center">
                  <StatusBadge status={item.status || "نشط"} />
                </td>
                <td className="px-5 py-4 text-left">
                  <RowActionButtons
                    onMoveUp={() => onMoveItem(itemType, item.id, "up")}
                    onMoveDown={() => onMoveItem(itemType, item.id, "down")}
                    onDuplicate={onDuplicateItem ? () => onDuplicateItem(item) : undefined}
                    onEdit={() => onEditItem(item)}
                    onDelete={() => onDeleteItem(item.id)}
                  />
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={itemType === "destinations" ? 4 : 5} className="px-5 py-10 text-center text-gray-400 font-medium bg-white">
                لا توجد عناصر مطابقة للبحث أو الفلتر
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export const UniversalItemsMobileCards: React.FC<UniversalItemsTableProps> = React.memo(({
  items,
  searchQuery,
  itemType,
  defaultCurrency = "",
  onMoveItem,
  onDuplicateItem,
  onEditItem,
  onDeleteItem,
}) => {
  return (
    <div className="block md:hidden">
      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {items.map((item) => {
            const title = item.title || item.name || "";
            return (
              <div key={item.id} className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        decoding="async"
                        loading="lazy"
                        src={optimizeImageUrl(item.image, 200)}
                        alt={title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ShieldCheck size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-semibold text-gray-800 text-xs leading-tight line-clamp-2">
                      <HighlightText text={title} search={searchQuery} />
                    </h4>
                    {itemType !== "destinations" ? (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
                        <span className="text-primary font-bold">
                          <HighlightText text={String(item.price || "")} search={searchQuery} /> {item.currency || defaultCurrency}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500">
                          <HighlightText text={item.duration || ""} search={searchQuery} />
                        </span>
                        <span className="text-gray-300">•</span>
                        <StatusBadge status={item.status || "نشط"} className="px-1.5 py-0.5" />
                      </div>
                    ) : (
                      <div className="pt-0.5">
                        <span className="px-2 py-0.5 rounded-xl bg-primary/5 text-primary text-[10px] font-semibold border border-primary/10">
                          <HighlightText text={item.category || ""} search={searchQuery} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-400">الإجراءات:</span>
                  <RowActionButtons
                    onMoveUp={() => onMoveItem(itemType, item.id, "up")}
                    onMoveDown={() => onMoveItem(itemType, item.id, "down")}
                    onDuplicate={onDuplicateItem ? () => onDuplicateItem(item) : undefined}
                    onEdit={() => onEditItem(item)}
                    onDelete={() => onDeleteItem(item.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-10 text-center text-gray-400 font-medium bg-white rounded-xl border border-gray-100">
          لا توجد عناصر مطابقة للبحث أو الفلتر
        </div>
      )}
    </div>
  );
});

export const BookingStatusSelect: React.FC<{
  status: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}> = ({ status, onChange, className = "" }) => (
  <select
    value={status}
    onChange={onChange}
    className={`cursor-pointer focus:outline-none transition-all !inline-flex !h-8 !w-auto px-2 py-0.5 rounded-xl text-xs font-medium border ${getStatusColor(status)} ${className}`}
  >
    <option value="قيد الانتظار">قيد الانتظار</option>
    <option value="مكتمل">مكتمل</option>
    <option value="ملغي">ملغي</option>
  </select>
);

export const UniversalItemsView: React.FC<UniversalItemsTableProps> = React.memo((props) => {
  return (
    <>
      <UniversalItemsTable {...props} />
      <UniversalItemsMobileCards {...props} />
    </>
  );
});
