import React from "react";

export interface Offer {
  id: number;
  title: string;
  price: string;
  duration: string;
  image: string;
  status: "نشط" | "مسودة";
  destination?: string;
  description?: string;
  currency?: string;
  category?: string;
}

export interface Visa {
  id: number;
  title: string;
  price: string;
  duration: string;
  processingTime: string;
  features: string[];
  status: "نشط" | "مسودة";
  image?: string;
  description?: string;
  descriptionTitle?: string;
  currency?: string;
}

export interface Destination {
  id: number;
  name: string;
  image: string;
  category: string;
  description?: string;
}

export interface Booking {
  id: string;
  name?: string;
  user?: string;
  phone?: string;
  email?: string;
  serviceType?: string;
  service?: string;
  date: string;
  status: string;
  amount?: string;
  details?: string;
  passportImage?: string | null;
  personalPhoto?: string | null;
  documents?: string | string[] | null;
  preferredContact?: string;
  preferredContactTime?: string;
  created_at?: string;
  // Flight specific
  flightType?: string;
  flightClass?: string;
  flightFrom?: string;
  flightTo?: string;
  flightDate?: string;
  flightReturnDate?: string;
  flightAdults?: string;
  flightChildren?: string;
  flightInfants?: string;
  flightPreferredTime?: string;
  flightPreference?: string;
  // Hotel specific
  hotelDestination?: string;
  hotelCheckIn?: string;
  hotelCheckOut?: string;
  hotelRooms?: string;
  hotelAdults?: string;
  hotelChildren?: string;
  hotelRating?: string;
  hotelType?: string;
  // Visa specific
  visaType?: string;
  visaNationality?: string;
  visaPurpose?: string;
  visaEntryDate?: string;
  visaDuration?: string;
  // Insurance specific
  insuranceType?: string;
  insuranceDuration?: string;
  insuranceStartDate?: string;
  insuranceAge?: string;
  // Company specific
  companyName?: string;
  companyType?: string;
  companyLocation?: string;
  companyActivity?: string;
}

export interface BookingFormProps {
  formData: any;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  today: string;
}
