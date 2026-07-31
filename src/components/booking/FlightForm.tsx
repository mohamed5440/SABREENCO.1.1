import React from "react";
import { FormGroup, FormInput, FormSelect } from "./FormFields";
import { BookingFormProps } from "../../types";

export const FlightForm: React.FC<BookingFormProps> = ({
  formData,
  onChange,
  today,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <FormGroup label="من">
        <FormInput
          type="text"
          name="flightFrom"

          value={formData.flightFrom || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="إلى">
        <FormInput
          type="text"
          name="flightTo"

          value={formData.flightTo || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="تاريخ الذهاب">
        <FormInput
          type="date"
          min={today}
          name="flightDate"
          value={formData.flightDate || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="تاريخ العودة">
        <FormInput
          type="date"
          min={formData.flightDate || today}
          name="flightReturnDate"
          value={formData.flightReturnDate || ""}
          onChange={onChange}
          disabled={formData.flightType === "one_way"}
        />
      </FormGroup>
      <FormGroup label="نوع الرحلة">
        <FormSelect
          name="flightType"
          value={formData.flightType || "round_trip"}
          onChange={onChange}
        >
          <option value="round_trip">ذهاب وعودة</option>
          <option value="one_way">ذهاب فقط</option>
          <option value="multi">وجهات متعددة</option>
        </FormSelect>
      </FormGroup>
      <FormGroup label="الدرجة">
        <FormSelect
          name="flightClass"
          value={formData.flightClass || "economy"}
          onChange={onChange}
        >
          <option value="economy">اقتصادية</option>
          <option value="business">رجال أعمال</option>
          <option value="first">درجة أولى</option>
        </FormSelect>
      </FormGroup>
      <FormGroup label="الوقت المفضل للرحلة">
        <FormSelect
          name="flightPreferredTime"
          value={formData.flightPreferredTime || "any"}
          onChange={onChange}
        >
          <option value="any">أي وقت</option>
          <option value="morning">صباحاً</option>
          <option value="afternoon">ظهراً</option>
          <option value="evening">مساءً</option>
        </FormSelect>
      </FormGroup>
      <FormGroup label="تفضيل التوقف">
        <FormSelect
          name="flightDirect"
          value={formData.flightDirect || "any"}
          onChange={onChange}
        >
          <option value="any">أي رحلة (مع توقف أو بدون)</option>
          <option value="direct">رحلات مباشرة فقط</option>
        </FormSelect>
      </FormGroup>
      <div className="grid grid-cols-3 gap-3 md:col-span-2">
        <FormGroup label="بالغين">
          <FormInput
            type="number"
            min="1"
            name="flightAdults"
            value={formData.flightAdults || "1"}
            onChange={onChange}
          />
        </FormGroup>
        <FormGroup label="أطفال">
          <FormInput
            type="number"
            min="0"
            name="flightChildren"
            value={formData.flightChildren || "0"}
            onChange={onChange}
          />
        </FormGroup>
        <FormGroup label="رضع">
          <FormInput
            type="number"
            min="0"
            name="flightInfants"
            value={formData.flightInfants || "0"}
            onChange={onChange}
          />
        </FormGroup>
      </div>
    </div>
  );
};
