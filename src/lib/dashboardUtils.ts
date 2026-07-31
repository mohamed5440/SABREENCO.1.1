export const serviceTranslations: Record<string, string> = {
  flight: "طيران",
  hotel: "فنادق",
  visa: "تأشيرات",
  insurance: "تأمين",
  offer: "عروض",
  company: "تأكيد الشركات",
};

export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  return `${amount.toLocaleString('ar-SA')} ${currency}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getFilterLabel = (type: string, value: string): string => {
  return `${type}: ${value}`;
};
