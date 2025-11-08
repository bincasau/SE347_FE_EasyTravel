export function formatPrice(value, currency = "VND", locale = "vi-VN") {
  if (value == null || isNaN(value)) return "0";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}
