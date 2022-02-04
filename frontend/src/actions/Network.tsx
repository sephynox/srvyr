// import React from "react";

export enum Networks {
  ETHEREUM = "Ethereum",
}

export enum nsLookupErrors {
  NO_ENS_SET = "No NS set for address.",
  NO_DATA = "No lookup data provided",
}

export enum TokenLookupErrors {
  FAILED = "Call to retrieve token information failed.",
}

export type Address = string;

export type NSLookupCache = {
  forward: Record<Address, NSLookupData>;
  reverse: Record<string, NSLookupData>;
};

export type TokenLookupCache = {
  age: number;
  network: Record<Networks, TokenData[]>;
  name: Record<string, TokenData>;
  symbol: Record<string, TokenData>;
  contract: Record<Address, TokenData>;
};

export type NSLookupData = {
  network: Networks;
  ns?: string | null | undefined;
  address?: Address | null | undefined;
};

export type TokenData = {
  network: Networks;
  name: string;
  symbol: string;
  contract: Address;
  precision: number;
};

export type AssetPriceData = TokenData & {
  price: string;
};

export type AssetAmountData = TokenData & {
  amount: string;
};

export type AssetPortfolio = Record<string, AssetAmountState>;

export type AssetPortfolioCache = Record<string, AssetPortfolio>;

export enum NSLookupStates {
  EMPTY,
  FETCHING,
  ERROR,
  NO_RESOLVE,
  SUCCESS,
}

export enum TokenLookupStates {
  EMPTY,
  FETCHING,
  ERROR,
  SUCCESS,
}

export enum AssetLookupStates {
  EMPTY,
  FETCHING,
  ERROR,
  SUCCESS,
}

export type NSLookupState =
  | { type: typeof NSLookupStates.EMPTY; data?: NSLookupData }
  | { type: typeof NSLookupStates.FETCHING; data?: NSLookupData }
  | { type: typeof NSLookupStates.ERROR; data?: NSLookupData; error: nsLookupErrors }
  | { type: typeof NSLookupStates.NO_RESOLVE; data: NSLookupData }
  | { type: typeof NSLookupStates.SUCCESS; data: NSLookupData };

export type TokenLookupState =
  | { type: typeof TokenLookupStates.EMPTY; data?: TokenData[] }
  | { type: typeof TokenLookupStates.FETCHING; data?: TokenData[] }
  | { type: typeof TokenLookupStates.ERROR; data?: TokenData[]; error: TokenLookupErrors }
  | { type: typeof TokenLookupStates.SUCCESS; data: TokenData[] };

export type AssetAmountState =
  | { type: typeof AssetLookupStates.EMPTY; data?: AssetAmountData }
  | { type: typeof AssetLookupStates.FETCHING; data?: AssetAmountData }
  | { type: typeof AssetLookupStates.ERROR; data?: AssetAmountData; error: nsLookupErrors }
  | { type: typeof AssetLookupStates.SUCCESS; data: AssetAmountData };

export const initialNSLookupState: NSLookupState = {
  type: NSLookupStates.EMPTY,
};

export const initialTokenLookupState: TokenLookupState = {
  type: TokenLookupStates.EMPTY,
};

export const initialNSLookupCache: NSLookupCache = {
  forward: {},
  reverse: {},
};

export const initialTokenLookupCache: TokenLookupCache = {
  age: 0,
  network: {
    [Networks.ETHEREUM]: [],
  },
  name: {},
  symbol: {},
  contract: {},
};

export const buildTokenCache = (data: TokenData[]): TokenLookupCache => {
  const cache = { ...initialTokenLookupCache, age: Date.now() };

  data.forEach((tokenLookupData) => {
    cache.network[tokenLookupData.network] = Array.from(
      new Set([tokenLookupData, ...cache.network[tokenLookupData.network]])
    );
    cache.name[tokenLookupData.name] = tokenLookupData;
    cache.symbol[tokenLookupData.symbol] = tokenLookupData;
    cache.contract[tokenLookupData.contract] = tokenLookupData;
  });

  return cache;
};

export const addAddressCache = (cache: NSLookupCache, data: NSLookupData): NSLookupCache => {
  if (data.address) {
    cache.forward = { ...cache.forward, ...{ [data.address]: data } };
  }

  if (data.ns) {
    cache.reverse = { ...cache.reverse, ...{ [data.ns]: data } };
  }

  return cache;
};
