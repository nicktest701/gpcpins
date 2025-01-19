export const currencyFormatter = (amount) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  return formatter.format(amount);
};
