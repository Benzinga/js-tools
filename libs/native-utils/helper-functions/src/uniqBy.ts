export const uniqBy = <T>(arr: T[], predicate: ((elem: T) => boolean) | string): T[] => {
  const extract = typeof predicate === 'function' ? predicate : (elem: T) => elem[predicate];
  return [
    ...arr
      .reduce((map, elem) => {
        if (elem !== null && elem !== undefined) {
          const key = extract(elem);
          if (!map.has(key)) {
            map.set(key, elem);
          }
        }
        return map;
      }, new Map())
      .values(),
  ];
};
