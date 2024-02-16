const currencyFormatter = (amount) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
};

module.exports = currencyFormatter;
