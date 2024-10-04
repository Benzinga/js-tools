export const getValueFromCookie = (key: string): string | undefined => {
  if (typeof document !== 'undefined') {
    return document.cookie
      .split('; ')
      .find(cookie => cookie.startsWith(key))
      ?.split('=')[1];
  }
  return undefined;
};
