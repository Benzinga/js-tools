export const countNumberOfDecimalPoints = (number: number): number =>
  Math.floor(number) === number ? 0 : number.toString().split('.')[1].length || 0;

export const floatAdd = (n1: number, n2: number) => {
  const power = Math.max(countNumberOfDecimalPoints(n1), countNumberOfDecimalPoints(n2));
  const multiplier = Math.pow(10, power);
  return (Math.floor(n1 * multiplier) + Math.floor(n2 * multiplier)) / multiplier;
};

export const floatSubtract = (n1: number, n2: number) => {
  const power = Math.max(countNumberOfDecimalPoints(n1), countNumberOfDecimalPoints(n2));
  const multiplier = Math.pow(10, power);
  return (Math.floor(n1 * multiplier) - Math.floor(n2 * multiplier)) / multiplier;
};

export const roundHalfEven = (number: number) => {
  if (number % 1 === 0.5) {
    const floor = Math.floor(number);
    return floor % 2 === 0 ? floor : floor + 1;
  } else {
    return Math.round(number);
  }
};

export const roundHalfEvenOneDecimals = (number: number) => roundHalfEven(number * 10) / 10;
export const roundHalfEvenTwoDecimals = (number: number) => roundHalfEven(number * 100) / 100;
