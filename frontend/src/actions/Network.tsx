// import React from "react";

export enum Networks {
  ETHEREUM = "Ethereum",
}

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
  network: Record<Networks, TokenData[]>;
  name: Record<string, TokenData>;
  symbol: Record<string, TokenData>;
  contract: Record<Contract, TokenData>;
};

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

export type AssetPortfolio = Record<Contract, string>;

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

export enum AssetPortfolioStates {
  EMPTY,
  FETCHING,
  ERROR,
  SUCCESS,
}

export enum PriceLookupStates {
  EMPTY,
  FETCHING,
  ERROR,
  SUCCESS,
}

export type NSLookupState =
  | { type: typeof NSLookupStates.EMPTY; data?: NSLookupData }
  | { type: typeof NSLookupStates.FETCHING; data?: NSLookupData }
  | { type: typeof NSLookupStates.ERROR; data?: NSLookupData; error: NSLookupErrors }
  | { type: typeof NSLookupStates.NO_RESOLVE; data: NSLookupData }
  | { type: typeof NSLookupStates.SUCCESS; data: NSLookupData };

export type TokenLookupState =
  | { type: typeof TokenLookupStates.EMPTY; data?: TokenData[] }
  | { type: typeof TokenLookupStates.FETCHING; data?: TokenData[] }
  | { type: typeof TokenLookupStates.ERROR; data?: TokenData[]; error: TokenLookupErrors }
  | { type: typeof TokenLookupStates.SUCCESS; data: TokenData[] };

export type AssetPortfolioState =
  | { type: typeof AssetPortfolioStates.EMPTY; address: string; data?: AssetPortfolio }
  | { type: typeof AssetPortfolioStates.FETCHING; address: string; data?: AssetPortfolio }
  | { type: typeof AssetPortfolioStates.ERROR; address: string; data?: AssetPortfolio; error: AssetPortfolioErrors }
  | { type: typeof AssetPortfolioStates.SUCCESS; address: string; data: AssetPortfolio };

export type PriceLookupState =
  | { type: typeof PriceLookupStates.EMPTY; data?: PriceData }
  | { type: typeof PriceLookupStates.FETCHING; data?: PriceData }
  | { type: typeof PriceLookupStates.ERROR; data?: PriceData; error: TokenLookupErrors }
  | { type: typeof PriceLookupStates.SUCCESS; data: PriceData };

export const initialNSLookupState: NSLookupState = {
  type: NSLookupStates.EMPTY,
};

export const initialTokenLookupState: TokenLookupState = {
  type: TokenLookupStates.EMPTY,
};

export const initialAssetPortfolioState: AssetPortfolioState = {
  type: AssetPortfolioStates.EMPTY,
  address: "",
  data: {},
};

export const initialPriceLookupState: PriceLookupState = {
  type: PriceLookupStates.EMPTY,
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

export const initialAssetPortfolioCache: AssetPortfolioCache = {};
export const initialPriceLookupCache: PriceLookupCache = {};

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
    cache.network[tokenLookupData.network] = Array.from(
      new Set([tokenLookupData, ...cache.network[tokenLookupData.network]])
    );
    cache.name[tokenLookupData.name] = tokenLookupData;
    cache.symbol[tokenLookupData.ticker] = tokenLookupData;
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
