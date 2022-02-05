import { ethers } from "ethers";
import { Dispatch } from "react";
import { BalanceChecker } from "../hardhat/typechain/BalanceChecker";
import { isCacheValid } from "../utils/data-helpers";

import {
  addAssetPortfolio,
  Address,
  AssetPortfolioCache,
  AssetPortfolioErrors,
  AssetPortfolioState,
  AssetPortfolioStates,
  Contract,
  Networks,
  NSLookupCache,
  NSLookupData,
  NSLookupErrors,
  NSLookupState,
  NSLookupStates,
  TokenLookupErrors,
  TokenLookupState,
  TokenLookupStates,
} from "./Network";

export const REGEX_ETHEREUM_ADDRESS = "/^0x[a-fA-F0-9]{40}$/";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export enum EthereumTokenStandards {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
}

export enum GasePriceErrors {
  FAILED = "Call to retrieve price information failed.",
}

export enum GasPriceStates {
  EMPTY,
  FETCHING,
  ERROR,
  SUCCESS,
}

export type EtherUnits = "wei" | "kwei" | "mwei" | "gwei" | "szabo" | "finney" | "ether";

export type GasPriceState =
  | { type: typeof GasPriceStates.EMPTY; data?: string }
  | { type: typeof GasPriceStates.FETCHING; data?: string }
  | { type: typeof GasPriceStates.ERROR; data?: undefined; error: GasePriceErrors }
  | { type: typeof GasPriceStates.SUCCESS; data: string };

export const initiaGasPriceState: GasPriceState = {
  type: GasPriceStates.EMPTY,
};

export const gasePriceReducer = (state: GasPriceState, action: GasPriceState): GasPriceState => {
  switch (action.type) {
    case GasPriceStates.FETCHING:
      return { type: action.type };
    case GasPriceStates.SUCCESS:
      return { type: action.type, data: action.data };
    case GasPriceStates.ERROR:
      return { type: action.type, error: action.error };
    default:
      return initiaGasPriceState;
  }
};

export const fetchAddress =
  (lookup: NSLookupData, provider: ethers.providers.Provider, cache?: NSLookupCache) =>
  async (dispatch: Dispatch<NSLookupState>) => {
    dispatch({ type: NSLookupStates.FETCHING });

    let promise: Promise<string | null>;
    let check: number;

    if (lookup.address) {
      check = 1;
      lookup.address = ethers.utils.getAddress(lookup.address);

      if (!ethers.utils.isAddress(lookup.address)) {
        dispatch({ type: NSLookupStates.ERROR, error: NSLookupErrors.INVALID_ADDRESS });
        return Promise.reject({ message: NSLookupErrors.INVALID_ADDRESS });
      }

      if (cache && cache.forward[lookup.address]) {
        promise = Promise.resolve(cache.forward[lookup.address].ns ?? null);
      } else {
        promise = provider.lookupAddress(lookup.address);
      }
    } else if (lookup.ns) {
      check = 2;

      if (cache && cache.reverse[lookup.ns]) {
        promise = Promise.resolve(cache.forward[lookup.ns].address ?? null);
      } else {
        promise = provider.resolveName(lookup.ns);
      }
    } else {
      promise = Promise.reject({ message: NSLookupErrors.NO_DATA });
    }

    return promise.then(
      (result) => {
        let state: NSLookupState;

        if (!result) {
          state = { type: NSLookupStates.NO_RESOLVE, data: lookup };
        } else {
          const compile = {
            network: Networks.ETHEREUM,
            address: check === 2 ? ethers.utils.getAddress(result) : lookup.address,
            ens: check === 1 ? result : lookup.ns,
          };
          state = { type: NSLookupStates.SUCCESS, data: compile };
        }

        dispatch(state);
      },
      (error) => {
        // Testing
        if (error.message.search("network does not support ENS") !== -1) {
          dispatch({ type: NSLookupStates.NO_RESOLVE, data: lookup });
        } else {
          dispatch({ type: NSLookupStates.ERROR, error: error.message });
        }
      }
    );
  };

export const fetchGasPrice =
  (format: EtherUnits, provider: ethers.providers.Provider) => async (dispatch: Dispatch<GasPriceState>) => {
    dispatch({ type: GasPriceStates.FETCHING });

    return provider.getGasPrice().then(
      (result) => {
        if (!result) {
          dispatch({ type: GasPriceStates.ERROR, error: GasePriceErrors.FAILED });
        } else {
          dispatch({ type: GasPriceStates.SUCCESS, data: ethers.utils.formatUnits(result, format) });
        }
      },
      (error) => dispatch({ type: GasPriceStates.ERROR, error: error.message })
    );
  };

export const fetchTokens = (type: string) => async (dispatch: Dispatch<TokenLookupState>) => {
  dispatch({ type: TokenLookupStates.FETCHING });

  return fetch(`/data/${type}.json`)
    .then((response) => response.json())
    .then(
      (result) => {
        if (!result) {
          dispatch({ type: TokenLookupStates.ERROR, error: TokenLookupErrors.FAILED });
        } else {
          dispatch({ type: TokenLookupStates.SUCCESS, data: result });
        }
      },
      (error) => {
        dispatch({ type: TokenLookupStates.ERROR, error: error.message });
      }
    );
};

export const fetchBalances =
  (
    address: Address,
    contractAddresses: Contract[],
    balanceChecker: BalanceChecker,
    cache?: AssetPortfolioCache,
    ttl?: number
  ) =>
  async (dispatch: Dispatch<AssetPortfolioState>) => {
    dispatch({ type: AssetPortfolioStates.FETCHING, address });

    if (!ethers.utils.isAddress(address)) {
      dispatch({ type: AssetPortfolioStates.ERROR, address, error: AssetPortfolioErrors.INVALID_ADDRESS });
      return Promise.reject({ message: AssetPortfolioErrors.INVALID_ADDRESS });
    }

    try {
      let promise: Promise<string[]>;

      if (cache && ttl && cache[address] && cache[address].data && isCacheValid(cache[address].age, ttl)) {
        promise = Promise.resolve(cache[address].data).then((portfolio) => Object.values(portfolio));
      } else {
        promise = balanceChecker
          .attach(`${process.env.REACT_APP_TEMP_BALANCECHECKER_CONTRACT}`) // FIXME
          .tokenBalances([address], contractAddresses)
          .then((balances) => balances.map((balance) => ethers.utils.formatUnits(balance)));
      }

      return promise
        .then((balances) => {
          return addAssetPortfolio(contractAddresses, balances);
        })
        .then((data) => {
          dispatch({ type: AssetPortfolioStates.SUCCESS, data: data, address });
        });
    } catch (e) {
      dispatch({ type: AssetPortfolioStates.ERROR, address, error: AssetPortfolioErrors.FAILED });
      return Promise.reject(e);
    }
  };
