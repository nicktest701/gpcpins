const moment = require('moment');
const _ = require('lodash');

function getWeekNumber(date) {
  const currentDate = date || moment();
  return currentDate.isoWeek();
}

function getDatesInWeek(year, month, weekNumber) {
  const firstDayOfWeek = moment()
    .year(year)
    .month(month)
    .startOf('month')
    .add((weekNumber - 1) * 7, 'days');
  const datesInWeek = [];


  for (let i = 0; i < 7; i++) {
    const currentDay = moment(firstDayOfWeek).add(i, 'days');
    datesInWeek.push(currentDay.toDate());
  }

  return datesInWeek;
}

function getDatesOfLastSevenDates(pattern) {
  const firstDayOfWeek = moment();

  const datesInWeek = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = moment(firstDayOfWeek).subtract(i, 'days');
    datesInWeek.push(currentDay.format(pattern || 'ddd,Do MMM'));
  }

  return datesInWeek?.reverse();
}

function isDateInThisMonthYear(date) {
  return (
    moment(date).month() + 1 === moment().month() + 1 &&
    moment(date).year() === moment().year()
  );
}
function isDateInMonthYear(date, targetMonth, targetYear) {
  return (
    moment(date).month() + 1 === targetMonth &&
    moment(date).year() === targetYear
  );
}

function groupDatesByMonth(dates) {
  const groupedDates = _.groupBy(dates, (date) =>
    moment(date).format('MM-YYYY')
  );
  return groupedDates;
}

function hasTokenExpired(date) {
  const currentDate = moment(); // Current date and time
  const tokenDate = moment(date); // Another date and time

  // Calculate the difference in minutes
  const minutesDifference = currentDate.diff(tokenDate, 'minutes');


  // Check if the difference is more than 15 minutes
  return minutesDifference > 15;
}

function parseDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return { error: "startDate and endDate are required" };
  }

  const isDateOnly = (val) => /^\d{4}-\d{2}-\d{2}$/.test(val);
  const isISO = (val) => !isNaN(new Date(val).getTime());

  let start, end;

  // Handle startDate
  if (isDateOnly(startDate)) {
    start = new Date(`${startDate}T00:00:00.000Z`);
  } else if (isISO(startDate)) {
    start = new Date(startDate);
  } else {
    return { error: "Invalid startDate format" };
  }

  // Handle endDate
  if (isDateOnly(endDate)) {
    end = new Date(`${endDate}T23:59:59.999Z`);
  } else if (isISO(endDate)) {
    end = new Date(endDate);
  } else {
    return { error: "Invalid endDate format" };
  }

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: "Invalid date values" };
  }

  if (start > end) {
    return { error: "startDate cannot be greater than endDate" };
  }

  return { start, end };
}

module.exports = {
  getWeekNumber,
  getDatesInWeek,
  isDateInMonthYear,
  groupDatesByMonth,
  getDatesOfLastSevenDates,
  hasTokenExpired,
  parseDateRange
};
