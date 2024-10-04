import { isNil } from './is';

export const numberOfDecimalPlaces = (value: number): number => {
  // fastest method according to jsperf.com
  if (Math.floor(value) === value) {
    return 0;
  }
  if (value.toString().match(/\./)) {
    return value.toString().split('.')[1].length || 0;
  }
  return 0;
};

interface FormatPriceOptions {
  showNearZero?: boolean;
  fixedPlace?: number;
}

export const formatPriceWithCurrency = (input: number, currency?: string, options?: FormatPriceOptions) => {
  const value = formatPrice(input, options);
  if (currency === 'USD' || currency === '$' || !currency) {
    return `$${value}`;
  } else if (currency === 'EUR') {
    return `€${value}`;
  } else if (currency === 'INR') {
    return `₹${value}`;
  } else if (currency === 'GBP') {
    return `£${value}`;
  } else if (currency === 'JPY') {
    return `¥${value}`;
  } else {
    return `${value} ${currency}`;
  }
};

export const formatPrice = (
  input: number,
  options?: {
    showNearZero?: boolean;
    fixedPlace?: number;
    removeTrailingZero?: boolean;
  },
): string => {
  const { fixedPlace, removeTrailingZero, showNearZero = false } = options || {};

  // filters out non-numbers, +/-Infinity, and NaN, undefined, null
  if (!Number.isFinite(input)) {
    return '';
  }

  // 0 returns `0` with no deimal places
  if (input === 0) {
    return '0';
  }

  // return `~0` for numbers near zero
  if (input > -0.0001 && input < 0.0001 && !showNearZero) {
    return '~0';
  }

  if (removeTrailingZero) {
    return formatTrailingZero(input);
  }

  if (fixedPlace) {
    return input.toFixed(fixedPlace);
  }

  const places = numberOfDecimalPlaces(input);
  if (places > 0) {
    // maximum of 4 decimal places
    if (places > 4 && !showNearZero) {
      return input.toFixed(4);
    }
    if (places === 1) {
      return input.toFixed(2);
    }
    return input.toFixed(places);
  }

  // 0 decimal places, also could use `Number.isInteger(input)`
  if (places === 0) {
    return `${input}.00`;
  }

  // if our tests are correct, this return should be unreachable
  // but just in case
  return input.toString();
};

export const formatTrailingZero = (input: number, fractionDigits = 2): string => {
  return input.toFixed(fractionDigits).replace(/\.?0+$/, '');
};

export const formatPercentage = (n: number | string, disableDecimalIfZero = false): string => {
  n = typeof n === 'string' ? Number(n) : n;
  const changeAbs = Math.abs(n);

  if (changeAbs >= 10) {
    const result = n.toFixed(1);
    return disableDecimalIfZero && result.endsWith('.0') ? result.slice(0, -2) : result;
  }
  if (changeAbs > 0) {
    const result = n.toFixed(2);
    return disableDecimalIfZero && result.endsWith('.00') ? result.slice(0, -3) : result;
  }
  if (n === 0) return '0.00';

  return n?.toString();
};

export const formatLarge = (num: number) => {
  if (typeof num !== 'number') {
    return num;
  }

  if (num >= 1000000000000 || num <= -1000000000000) {
    return `${(num / 1000000000000).toFixed(1)?.replace(/\.0$/, '')}T`;
  }

  if (num >= 1000000000 || num <= -1000000000) {
    return `${(num / 1000000000).toFixed(1)?.replace(/\.0$/, '')}B`;
  }

  if (num >= 1000000 || num <= -1000000) {
    return `${(num / 1000000).toFixed(1)?.replace(/\.0$/, '')}M`;
  }

  return `${(num / 1000).toFixed(1)?.replace(/\.0$/, '')}K`;
};

export const formatRound = (num: number) => {
  if (typeof num !== 'number') {
    return num;
  }
  return Math.round(num * 100) / 100;
};

export const formatRoundFixed = (num: number, decimals: number) => {
  if (typeof num !== 'number') {
    return num;
  }
  const rounded = Math.round(num * 100) / 100;
  return rounded.toFixed(decimals);
};

export const abbreviateNumber = (value: number, options?: Intl.NumberFormatOptions) => {
  const numberFormatter = Intl.NumberFormat('en', {
    minimumFractionDigits: 1,
    notation: 'compact',
    ...options,
  } as Intl.NumberFormatOptions);
  const abbreviatedNumber = numberFormatter.format(value);
  return abbreviatedNumber;
};

const INFINITY = 1 / 0;
const MAX_INTEGER = 1.7976931348623157e308;

function toFinite(value: number) {
  if (!value) {
    return value === 0 ? value : 0;
  }

  const res = Number(value);

  if (res === INFINITY || res === -INFINITY) {
    const sign = res < 0 ? -1 : 1;
    return sign * MAX_INTEGER;
  }

  return res === value ? value : 0;
}

function baseRange(start: number, end: number, step: number) {
  let index = -1;
  let length = Math.max(Math.ceil((end - start) / (step || 1)), 0);
  const result = new Array(length);

  while (length--) {
    result[++index] = start;
    start += step;
  }

  return result;
}

export function numberRange(start: number, end: number, step: number) {
  start = toFinite(start);

  if (end === undefined) {
    end = start;
    start = 0;
  } else {
    end = toFinite(end);
  }

  step = step === undefined ? (start < end ? 1 : -1) : toFinite(step);

  return baseRange(start, end, step);
}

export const isOdd = (n: number) => Math.abs(n % 2) === 1;
export const isEven = (n: number) => Math.abs(n % 2) === 0;
const roundNumber = (value: number, numberOfDecimalPlaces: number) =>
  Math.round(value * Math.pow(10, numberOfDecimalPlaces)) / Math.pow(10, numberOfDecimalPlaces);


export function numberShorthand(
  value: string | number | null | undefined,
  numberOfDecimalPlaces = 3,
  removeTrailingZero?: boolean,
): string {
  if (isNil(value)) {
    return '';
  }

  const stringValue = typeof value === 'number' ? value.toString() : value;

  if (stringValue.length === 0) {
    return stringValue;
  }

  const regEx = /^([+-]{1})?((?:\d+)?(?:\.\d+)?)$/;
  const matches = regEx.exec(stringValue);

  // Dunno how this should be handled, actually.
  if (matches === null) {
    return stringValue;
  }

  let sign = matches[1];
  let num = Number.parseFloat(matches[2]);

  if (!sign) {
    sign = '';
  }

  if (!num) {
    return '0';
  }

  const numSignificantDigits = String(Math.round(num)).length;
  let signifier = '';
  let divisor = 1;

  if (numSignificantDigits >= 4 && numSignificantDigits < 7) {
    divisor = 1000;
    signifier = 'K';
  } else if (numSignificantDigits >= 7 && numSignificantDigits < 10) {
    divisor = 1000000;
    signifier = 'M';
  } else if (numSignificantDigits >= 10 && numSignificantDigits < 13) {
    divisor = 1000000000;
    signifier = 'B';
  } else if (numSignificantDigits >= 13) {
    divisor = 1000000000000;
    signifier = 'T';
  }

  num /= divisor;

  const roundedNumber = roundNumber(num, numberOfDecimalPlaces);
  let formattedNumber = roundedNumber.toFixed(numberOfDecimalPlaces);

  if (removeTrailingZero) {
    formattedNumber = formatTrailingZero(roundedNumber);
  }

  return `${sign}${formattedNumber}${signifier}`;
}

export function unshorthandValue(value: string) {
  if (!value) {
    return value;
  }

  const upperCaseValue = `${value}`.toUpperCase();
  let multiplier = 1;

  if (upperCaseValue.includes('K')) {
    multiplier = 1000;
  } else if (upperCaseValue.includes('M')) {
    multiplier = 1000000;
  } else if (upperCaseValue.includes('B')) {
    multiplier = 1000000000;
  } else if (upperCaseValue.includes('T')) {
    multiplier = 1000000000000;
  }

  return `${parseFloat(value) * multiplier}`;
}

export const isNumeric = (str: string) => {
  if (typeof str == 'number') return true;
  if (typeof str != 'string') return false;
  return (
    !isNaN(str as unknown as number) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
};
