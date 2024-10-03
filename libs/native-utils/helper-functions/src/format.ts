export const getNumberSuffix = (num: number): 'st' | 'nd' | 'rd' | 'th' => {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  if (lastDigit == 1 && lastTwoDigits != 11) {
    return 'st';
  }
  if (lastDigit == 2 && lastTwoDigits != 12) {
    return 'nd';
  }
  if (lastDigit == 3 && lastTwoDigits != 13) {
    return 'rd';
  }
  return 'th';
};

export const formatNumberSuffix = (num: number): string => `${num}${getNumberSuffix(num)}`;
