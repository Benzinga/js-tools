export const capitalize = (name: string): string => name.charAt(0).toUpperCase() + name.slice(1);

export const toTitleCase = (title: string): string => {
  if (!title) return '';

  return title
    .split(' ')
    .map(name => capitalize(name))
    .join(' ');
};

export const apostrophyName = (name: string) => {
  if (!name) return '';
  if (name[name.length - 1] === 's') return `${name}'`;
  return `${name}'s`;
};

export const camelCaseToTitleCase = (string: string) => capitalize(string?.replace(/([A-Z])/g, ' $1').trim());

export const snakeCaseToCamelCase = (string: string) => {
  return string?.replace(/([-_]\w)/g, g => g[1].toUpperCase()).replace(/^([A-Z])/g, g => g[0].toLowerCase());
};

export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
};

export const toSnakeCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '');
};

export const truncate = (text: string, length: number) => {
  if (!text || text.length <= length) return text;
  return `${text.slice(0, length)}...`;
};

export const doesWordStartWithAVowel = (word: string) => {
  const firstCharactor = word.charAt(0).toLowerCase();
  const result = ['a', 'e', 'i', 'o', 'u'].includes(firstCharactor);
  return result;
};

export const getCorrectIndefiniteArticle = (word: string) => {
  const result = doesWordStartWithAVowel(word) ? 'an' : 'a';
  return result;
};
