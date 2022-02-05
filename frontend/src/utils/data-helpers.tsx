// Thanks https://stackoverflow.com/a/38340730/8177368
export const cleanObject = <T,>(obj: T): T => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null)) as T;
};

export const chunkArray = <T,>(array: Array<T>, chunkSize: number): Array<Array<T>> => {
  const chunkedArray = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }

  return chunkedArray;
};

// Thanks https://stackoverflow.com/a/61414961/8177368
export type RecordableKeys<T> = {
  [K in keyof T]: T[K] extends string | number | symbol ? K : never;
}[keyof T];

export const arrayToRecord = <
  T extends { [P in RecordableKeys<T>]: string | number | symbol },
  K extends RecordableKeys<T>
>(
  array: T[],
  selector: K
): Record<T[K], T> => {
  return array.reduce((acc, item) => ({ ...acc, [item[selector]]: item }), {} as Record<T[K], T>);
};

export const randomNumber = (floor: number, ceil: number): number => {
  return Math.floor(Math.random() * (ceil - floor + 1) + floor);
};

export const stripTagsUnsafe = (input: string): string => {
  return input.replace(/<\/?[^>]+(>|$)/g, "");
};

export const unixDaysAgo = (n: number): number => {
  return Math.floor(new Date(new Date().setDate(new Date().getDate() - n)).getTime() / 1000);
};

export const isLightTheme = (): boolean => {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
};

export const cacheValid = <T,>(cache: T, age: number, ttl: number): T | undefined => {
  return age > Date.now() - ttl ? cache : undefined;
};

export const isCacheValid = (age: number, ttl: number): boolean => {
  return age > Date.now() - ttl;
};

export const shortDisplayAddress = (address?: string | null) => {
  if (!!address) {
    return `${address.substring(0, 5)}...${address.substring(address.length - 4, address.length)}`;
  } else {
    return "";
  }
};
