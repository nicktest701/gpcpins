// const formatPercentage = (value) => {
//     const formatter = new Intl.NumberFormat("en-US", {
//         style: "percent",
//         minimumFractionDigits: 2, // Set the number of decimal places (optional)
//         maximumFractionDigits: 0, // Set the number of decimal places (optional)
//     });

//     const formattedPercentage = formatter.format(value);
//     return formattedPercentage;
// };
const formatPercentage = (number) => {
    return (number * 100).toFixed(2) + '%';
};

// function formatToPercentage(number) {
//     return (number * 100).toFixed(2) + '%';
// }

module.exports = { formatPercentage }