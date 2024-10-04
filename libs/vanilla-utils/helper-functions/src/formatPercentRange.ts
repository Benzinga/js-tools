export const formatPercentRange = (value1: number | null, value2: number | null) => {
  const fixedValue1 = value1 && (value1 * 100).toFixed(0);
  const fixedValue2 = value2 && (value2 * 100).toFixed(0);

  if (value1 && value2) {
    return `${fixedValue1} - ${fixedValue2}%`;
  } else if (value1 && !value2) {
    return `${fixedValue1}%`;
  } else if (value2 && !value1) {
    return `${fixedValue2}%`;
  } else {
    return '-';
  }
};
