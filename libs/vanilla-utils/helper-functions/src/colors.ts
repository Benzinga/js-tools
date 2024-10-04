/**
 ** Hex color to RGBA color
 */
export const hexToRGBA = (hexCode: string, opacity: number) => {
  let hex = hexCode?.replace('#', '');

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default hexToRGBA;

/**
 ** RGA color to hex color
 */
export const rgbToHex = (color: number[]): string => {
  return '#' + ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1);
};
