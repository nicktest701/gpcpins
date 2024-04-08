// Make sure you have Moment.js library included in your project
const moment = require("moment");
function calculateTimeDifference(start, end) {
  const startDate = moment(start);
  const endDate = moment(end).add(1, "hours");

  const differenceInHours = endDate.diff(startDate, "hours");

  if (differenceInHours < 1) {
    const differenceInMinutes = endDate.diff(startDate, "minutes");
    return { type: "minutes", value: differenceInMinutes };
  } else {
    return {
      type: "hours",
      value: differenceInHours,
    };
  }
}

module.exports = {
  calculateTimeDifference,
};
