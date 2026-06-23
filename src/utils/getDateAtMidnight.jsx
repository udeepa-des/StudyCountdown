export const getDateAtMidnight = (dateString) => {
  const date = new Date(dateString);
  // Set to midnight in local timezone
  date.setHours(0, 0, 0, 0);
  return date;
};
