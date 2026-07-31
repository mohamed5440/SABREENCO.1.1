import React from "react";
import { FormGroup, FormInput, FormSelect } from "./FormFields";

interface CompanyFormProps {
  formData: any;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <FormGroup label="الدولة - المدينة">
        <FormInput
          type="text"
          name="companyCountry"

          value={formData.companyCountry || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="نوع الشركة">
        <FormSelect
          name="companyType"
          value={formData.companyType || "llc"}
          onChange={onChange}
        >
          <option value="llc">ذات مسؤولية محدودة (LLC)</option>
          <option value="freezone">منطقة حرة</option>
          <option value="offshore">أوفشور</option>
        </FormSelect>
      </FormGroup>
      <FormGroup label="عدد الشركاء">
        <FormInput
          type="number"
          min="1"
          name="companyPartners"

          value={formData.companyPartners || "1"}
          onChange={onChange}
        />
      </FormGroup>
    </div>
  );
};
