export const currencyFormatter = (amount) => {
  const formatter = new Intl.NumberFormat('en-GH', {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
};
