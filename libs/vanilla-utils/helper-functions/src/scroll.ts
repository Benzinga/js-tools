export const scrollDelay = (delay = 200, callback: () => void): void => {
  const scrollTrigger = window?.scrollY + delay;

  const scrollHandle = () => {
    if (window?.scrollY >= scrollTrigger) {
      window?.removeEventListener('scroll', scrollHandle);
      callback();
    }
  };

  window?.addEventListener('scroll', scrollHandle);
};
