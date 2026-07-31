import React from "react";
import { FormGroup, FormInput, FormSelect } from "./FormFields";
import { BookingFormProps } from "../../types";

export const VisaForm: React.FC<BookingFormProps> = ({
  formData,
  onChange,
  today,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <FormGroup label="الجنسية">
        <FormInput
          type="text"
          name="visaNationality"

          value={formData.visaNationality || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="الوجهة">
        <FormInput
          type="text"
          name="visaDestination"

          value={formData.visaDestination || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="نوع التأشيرة">
        <FormSelect
          name="visaType"
          value={formData.visaType || "tourist"}
          onChange={onChange}
        >
          <option value="tourist">سياحية</option>
          <option value="business">عمل</option>
          <option value="study">دراسة</option>
          <option value="medical">علاج</option>
        </FormSelect>
      </FormGroup>
      <FormGroup label="مدة الإقامة (أيام)">
        <FormInput
          type="number"
          name="visaDuration"

          value={formData.visaDuration || "30"}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="تاريخ السفر المتوقع">
        <FormInput
          type="date"
          min={today}
          name="visaDate"
          value={formData.visaDate || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="تاريخ انتهاء الجواز">
        <FormInput
          type="date"
          min={today}
          name="visaPassportExpiry"
          value={formData.visaPassportExpiry || ""}
          onChange={onChange}
        />
      </FormGroup>
    </div>
  );
};
