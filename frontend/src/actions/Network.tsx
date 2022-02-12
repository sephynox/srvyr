// import React from "react";

export enum Networks {
  ETHEREUM = "Ethereum",
}

export type NetworkViewer = {
  [keyof in Networks]: string;
};

export type NativeAsset = {
  [keyof in Networks]: string;
};

export enum NSLookupErrors {
  INVALID_ADDRESS = "The address provided is not a valid address.",
  NO_ENS_SET = "No NS set for address.",
  NO_DATA = "No lookup data provided",
}

export enum TokenLookupErrors {
  FAILED = "Call to retrieve token information failed.",
}

export enum AssetPortfolioErrors {
  INVALID_ADDRESS = "The address provided is not a valid address.",
  FAILED = "Call to retrieve asset information failed.",
}

export enum PriceLookupErrors {
  FAILED = "Call to retrieve token pricing data failed.",
}

export type Address = string;
export type Contract = Address;

export type ExpiringCache = {
  age: number;
};

export type NSLookupCache = {
  forward: Record<Address, NSLookupData>;
  reverse: Record<string, NSLookupData>;
};

export type TokenLookupCache = ExpiringCache & {
  network: Record<Networks, Record<Contract, TokenData>>;
  name: Record<string, TokenData>;
  symbol: Record<string, TokenData>;
  contract: Record<Contract, TokenData>;
};

export type TokenInterfacesCache = Record<
  Networks,
  ExpiringCache & {
    data: Record<string, unknown>;
  }
>;

export type PriceLookupCache = Record<
  Contract,
  ExpiringCache & {
    data: PriceData;
  }
>;

export type AssetPortfolioCache = Record<
  Address,
  ExpiringCache & {
    data: AssetPortfolio;
  }
>;

export type TransactionCache = Record<
  Address,
  ExpiringCache & {
    data: Transaction[];
  }
>;

export type NSLookupData = {
  network: Networks;
  ns?: string | null | undefined;
  address?: Address | null | undefined;
};

export type TokenFeed = {
  contract: Contract;
  precision: number;
};

export type TokenData = {
  network: Networks;
  name: string;
  ticker: string;
  contract: Contract;
  precision: number;
  price?: string;
  feeds?: Record<string, TokenFeed>;
};

export type PriceData = {
  epoch: string;
  price: string;
  timestamp: number;
};

export type Transaction = {
  network: Networks;
  hash: string;
  to: Contract;
  from: Contract;
  data: string;
  type: string;
  timestamp: number;
  fee?: string;
  extras: Record<string, string>;
};

export type AssetPortfolio = Record<Contract, string>;

export enum FetchStates {
  EMPTY,
  FETCHING,
  ERROR,
  SUCCESS,
}

export enum NSLookupStates {
  EMPTY,
  FETCHING,
  ERROR,
  NO_RESOLVE,
  SUCCESS,
}

export type FetchState<T> =
  | { type: typeof FetchStates.EMPTY; data?: T }
  | { type: typeof FetchStates.FETCHING; data?: T }
  | { type: typeof FetchStates.ERROR; data?: T; error: string }
  | { type: typeof FetchStates.SUCCESS; data: T };

export type NSLookupState =
  | { type: typeof NSLookupStates.EMPTY; data?: NSLookupData }
  | { type: typeof NSLookupStates.FETCHING; data?: NSLookupData }
  | { type: typeof NSLookupStates.ERROR; data?: NSLookupData; error: NSLookupErrors }
  | { type: typeof NSLookupStates.NO_RESOLVE; data: NSLookupData }
  | { type: typeof NSLookupStates.SUCCESS; data: NSLookupData };

export const initialNSLookupState: NSLookupState = {
  type: NSLookupStates.EMPTY,
};

export const initialNSLookupCache: NSLookupCache = {
  forward: {},
  reverse: {},
};

export const initialTokenLookupCache: TokenLookupCache = {
  age: 0,
  network: {
    [Networks.ETHEREUM]: {},
  },
  name: {},
  symbol: {},
  contract: {},
};

export const initialTokenInterfacesCache: TokenInterfacesCache = {
  [Networks.ETHEREUM]: {
    age: 0,
    data: {},
  },
};

export const initialAssetPortfolioCache: AssetPortfolioCache = {};
export const initialPriceLookupCache: PriceLookupCache = {};
export const initialTransactionCache: TransactionCache = {};

export const networkViewer: NetworkViewer = {
  [Networks.ETHEREUM]: "https://etherscan.io/tx/{}",
};

export const nativeAsset: NativeAsset = {
  [Networks.ETHEREUM]: "ETH",
};

export const addAssetPortfolio = (contracts: Contract[], amounts: string[]): AssetPortfolio => {
  const data: AssetPortfolio = {};

  amounts.forEach((amount, i) => {
    data[contracts[i]] = amount;
  });

  return data;
};

export const buildTokenCache = (data: TokenData[]): TokenLookupCache => {
  const cache = { ...initialTokenLookupCache, age: Date.now() };

  data.forEach((tokenLookupData) => {
    cache.network[tokenLookupData.network][tokenLookupData.contract] = tokenLookupData;
    cache.name[tokenLookupData.name] = tokenLookupData;
    cache.symbol[tokenLookupData.ticker] = tokenLookupData;
    cache.contract[tokenLookupData.contract] = tokenLookupData;
  });

  return cache;
};

export const buildPriceCache = (data: Record<string, PriceData>): PriceLookupCache => {
  const cache: PriceLookupCache = {};
  Object.keys(data).forEach((k) => (cache[k] = { age: Date.now(), data: data[k] }));
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
