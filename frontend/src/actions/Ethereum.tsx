import { ethers } from "ethers";
import { Dispatch } from "react";

import {
  Networks,
  NSLookupCache,
  NSLookupData,
  nsLookupErrors,
  NSLookupState,
  NSLookupStates,
  TokenLookupErrors,
  TokenLookupState,
  TokenLookupStates,
} from "./Network";

export const REGEX_ETHEREUM_ADDRESS = "/^0x[a-fA-F0-9]{40}$/";
export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

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
  async (dispatch: Dispatch<NSLookupState>): Promise<void> => {
    dispatch({ type: NSLookupStates.FETCHING });

    let promise: Promise<string | null>;
    let check: number;

    if (!!lookup.address) {
      check = 1;

      if (!!cache && !!cache.forward[lookup.address]) {
        promise = Promise.resolve(cache.forward[lookup.address].ns ?? null);
      } else {
        promise = provider.lookupAddress(lookup.address);
      }
    } else if (!!lookup.ns) {
      check = 2;

      if (!!cache && !!cache.reverse[lookup.ns]) {
        promise = Promise.resolve(cache.forward[lookup.ns].address ?? null);
      } else {
        promise = provider.resolveName(lookup.ns);
      }
    } else {
      promise = Promise.reject({ message: nsLookupErrors.NO_DATA });
    }

    return promise.then(
      (result) => {
        let state: NSLookupState;

        if (!result) {
          state = { type: NSLookupStates.NO_RESOLVE, data: lookup };
        } else {
          const compile = {
            network: Networks.ETHEREUM,
            address: check === 2 ? result : lookup.address,
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
  (format: EtherUnits, provider: ethers.providers.Provider) =>
  async (dispatch: Dispatch<GasPriceState>): Promise<void> => {
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

export const fetchTokens =
  (type: string) =>
  async (dispatch: Dispatch<TokenLookupState>): Promise<void> => {
    dispatch({ type: TokenLookupStates.FETCHING });

    fetch(`data/${type}.json`)
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

// export const fetchBalances =
//   (type: string) =>
//   async (dispatch: Dispatch<TokenLookupState>): Promise<void> => {
//     dispatch({ type: TokenLookupStates.FETCHING });
//   };
