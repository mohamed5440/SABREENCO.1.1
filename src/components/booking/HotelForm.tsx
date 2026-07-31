import React from "react";
import { FormGroup, FormInput, FormSelect } from "./FormFields";
import { BookingFormProps } from "../../types";

export const HotelForm: React.FC<BookingFormProps> = ({
  formData,
  onChange,
  today,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      <FormGroup label="المدينة أو الفندق المطلوب" className="md:col-span-2">
        <FormInput
          type="text"
          name="hotelCity"
          value={formData.hotelCity || ""}
          onChange={onChange}

          required
        />
      </FormGroup>
      <FormGroup label="تاريخ الوصول">
        <FormInput
          type="date"
          min={today}
          name="hotelCheckIn"
          value={formData.hotelCheckIn || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="تاريخ المغادرة">
        <FormInput
          type="date"
          min={formData.hotelCheckIn || today}
          name="hotelCheckOut"
          value={formData.hotelCheckOut || ""}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup label="نوع الغرفة">
        <FormSelect
          name="hotelRoomType"
          value={formData.hotelRoomType || "double"}
          onChange={onChange}
        >
          <option value="single">غرفة مفردة</option>
          <option value="double">غرفة مزدوجة</option>
          <option value="triple">غرفة ثلاثية</option>
          <option value="suite">جناح</option>
        </FormSelect>
      </FormGroup>
      <FormGroup label="نظام الوجبات">
        <FormSelect
          name="hotelMealPlan"
          value={formData.hotelMealPlan || "breakfast"}
          onChange={onChange}
        >
          <option value="room_only">بدون وجبات</option>
          <option value="breakfast">إفطار</option>
          <option value="half_board">إقامة مع وجبتين</option>
          <option value="full_board">إقامة كاملة</option>
          <option value="all_inclusive">شامل كلياً</option>
        </FormSelect>
      </FormGroup>
      <div className="grid grid-cols-3 gap-3 md:col-span-2">
        <FormGroup label="بالغين">
          <FormInput
            type="number"
            min="1"
            name="hotelAdults"
            value={formData.hotelAdults || "1"}
            onChange={onChange}
          />
        </FormGroup>
        <FormGroup label="أطفال">
          <FormInput
            type="number"
            min="0"
            name="hotelChildren"
            value={formData.hotelChildren || "0"}
            onChange={onChange}
          />
        </FormGroup>
        <FormGroup label="عدد الغرف">
          <FormInput
            type="number"
            min="1"
            name="hotelRooms"
            value={formData.hotelRooms || "1"}
            onChange={onChange}
          />
        </FormGroup>
      </div>
    </div>
  );
};
