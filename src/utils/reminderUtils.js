export const getAdvanceMs = (reminder) => {
  if (reminder.exactTime) return 0;
  const amount = Number(reminder.advanceNotice) || 0;
  switch (reminder.advanceUnit) {
    case "minutes":
      return amount * 60 * 1000;
    case "hours":
      return amount * 60 * 60 * 1000;
    case "days":
      return amount * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
};
