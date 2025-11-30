/**
 * Helper functions for date ranges used by dashboard charts.
 */
function getDateRanges(period = '1m') {
  const endDate = new Date();
  let startDate = new Date();
  let groupFormat = '$dateToString';

  switch (period) {
    case '1w':
      startDate.setDate(endDate.getDate() - 7);
      groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      break;
    case '1m':
      startDate.setMonth(endDate.getMonth() - 1);
      groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      break;
    case '6m':
      startDate.setMonth(endDate.getMonth() - 6);
      groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 1);
      groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }

  return { startDate, endDate, groupFormat };
}

function formatDate(date) {
  return new Date(date).toISOString();
}

module.exports = { getDateRanges, formatDate };
