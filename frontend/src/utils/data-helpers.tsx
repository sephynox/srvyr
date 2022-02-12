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

export const spliceOrArray = <T,>(val: T, array: T[]): T[] => {
  const remove = array.indexOf(val);

  if (remove > -1) {
    array.splice(remove, 1);
  }

  return array;
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

export const shortDisplayAddress = (address?: string | null, start = 6, end = 4) => {
  if (!!address) {
    return `${address.substring(0, start)}...${address.substring(address.length - end, address.length)}`;
  } else {
    return "";
  }
};

export const shortTransactionHash = (address?: string | null) => {
  return shortDisplayAddress(address, 3, 5);
};

export const localStoreOr = <T,>(key: string, fallback: T): T => {
  const store = localStorage.getItem(key);

  if (store) {
    return { ...fallback, ...JSON.parse(store) };
  } else {
    return fallback;
  }
};

export const createEnumChecker = <T extends string, TEnumValue extends string>(enumVariable: {
  [key in T]: TEnumValue;
}) => {
  const enumValues = Object.values(enumVariable);
  return (value: string): value is TEnumValue => enumValues.includes(value);
};

export const formatNumber = (n: number | bigint, lang: string, r?: number, opts?: Intl.NumberFormatOptions): string => {
  return `${Intl.NumberFormat(lang, { maximumFractionDigits: r ?? 16, ...opts }).format(n)}`;
};

export const formatPrice = (n: number | bigint, r = 2, lang: string, currency: string): string => {
  return formatNumber(n, lang, r, { style: "currency", currency: currency });
};

export const datedRecordFromArray = <T extends { timestamp: number }>(data: T[]): Record<number, T[]> => {
  const result: Record<number, T[]> = {};
  data.forEach((entry) => {
    const date = new Date(new Date(entry.timestamp * 1000).toDateString()).getTime();
    if (!result[date]) {
      result[date] = [entry];
    } else {
      result[date].push(entry);
    }
  });
  return result;
};
