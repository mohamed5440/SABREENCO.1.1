export const serviceTranslations: Record<string, string> = {
  flight: "طيران",
  hotel: "فنادق",
  visa: "تأشيرات",
  insurance: "تأمين",
  offer: "عروض",
  company: "تأكيد الشركات",
};

// Cached formatters for high performance rendering in tables/lists
const numberFormatter = new Intl.NumberFormat('ar-SA');
const dateFormatter = new Intl.DateTimeFormat('ar-SA', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return `0 ${currency}`;
  return `${numberFormatter.format(amount)} ${currency}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return dateFormatter.format(date);
};

export const getFilterLabel = (type: string, value: string): string => {
  return `${type}: ${value}`;
};
