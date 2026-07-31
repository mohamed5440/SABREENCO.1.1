import React from "react";
import { FormGroup, FormInput } from "./FormFields";
import { BookingFormProps } from "../../types";

export const InsuranceForm: React.FC<BookingFormProps> = ({
  formData,
  onChange,
  today,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <FormGroup label="الوجهة" className="md:col-span-2">
        <FormInput
          type="text"
          name="insuranceDestination"

          value={formData.insuranceDestination || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="تاريخ البداية">
        <FormInput
          type="date"
          min={today}
          name="insuranceStartDate"
          value={formData.insuranceStartDate || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="تاريخ النهاية">
        <FormInput
          type="date"
          min={formData.insuranceStartDate || today}
          name="insuranceEndDate"
          value={formData.insuranceEndDate || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="تاريخ الميلاد">
        <FormInput
          type="date"
          name="insuranceDOB"
          max={today}
          value={formData.insuranceDOB || ""}
          onChange={onChange}
        />
      </FormGroup>
    </div>
  );
};
