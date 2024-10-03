export const runningClientSide = (): boolean => typeof window !== 'undefined';

export const runningServerSide = (): boolean => typeof window === 'undefined';
