import React from "react";
import { CheckCircle2, LucideIcon } from "lucide-react";

interface FormGroupProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  className = "",
  children,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block label-caps mb-2 pr-1">{label}</label>
      {children}
    </div>
  );
};

export type FormInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const FormInput: React.FC<FormInputProps> = ({
  className = "",
  ...props
}) => {
  return (
    <input
      className={`w-full h-12 bg-white border border-gray-200 rounded-xl px-3 sm:px-4 text-sm font-medium focus:outline-none focus:border-primary transition-all disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

export type FormSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const FormSelect: React.FC<FormSelectProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <select
      className={`w-full h-12 bg-white border border-gray-200 rounded-xl px-3 sm:px-4 text-sm font-medium focus:outline-none focus:border-primary transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

interface FileAttachmentInputProps {
  label: string;
  hasFile: boolean;
  icon: LucideIcon;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadText?: string;
}

export const FileAttachmentInput: React.FC<FileAttachmentInputProps> = ({
  label,
  hasFile,
  icon: Icon,
  accept = "image/*",
  onChange,
  uploadText = "رفع صورة",
}) => {
  return (
    <div className="space-y-2">
      <label className="block label-caps mb-2 pr-1">{label}</label>
      <div className="relative h-24 bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {hasFile ? (
          <CheckCircle2 className="text-primary" size={24} />
        ) : (
          <Icon className="text-gray-500" size={24} />
        )}
        <span className="text-[10px] font-medium text-gray-500 mt-2">
          {hasFile ? "تم الرفع" : uploadText}
        </span>
      </div>
    </div>
  );
};

