/**
 *
 * @param data {Array} Array to chunkify
 * @param chunkSize {number} Max size of every chunk
 * @returns An array of arrays;
 */

export const chunkifyArray = <T>(data: Array<T>, chunkSize: number): Array<Array<T>> => {
  const results: Array<Array<T>> = [];
  while (data.length) {
    const splicedData = data.splice(0, chunkSize);
    results.push(splicedData);
  }
  return results;
};

export const shuffleArray = (array: any[]) => {
  if (Array.isArray(array)) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
};

export const removeItemsFromArray = <T>(array: T[], ...args: T[]): T[] => array.filter(a => !args.includes(a));
