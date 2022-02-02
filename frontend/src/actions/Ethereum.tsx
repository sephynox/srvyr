import { ethers } from "ethers";
import { Dispatch } from "react";

export const REGEX_ETHEREUM_ADDRESS = "/^0x[a-fA-F0-9]{40}$/";
export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

export enum EnsLookupErrors {
  NO_ENS_SET = "No ENS set for address.",
  NO_DATA = "No lookup data provided",
}

export enum GasePriceErrors {
  FAILED = "Call to retrieve price information failed.",
}

export enum EnsLookupStates {
  EMPTY,
  FETCHING,
  ERROR,
  NO_RESOLVE,
  SUCCESS,
}

export enum GasPriceStates {
  EMPTY,
  FETCHING,
  ERROR,
  SUCCESS,
}

export type EtherUnits = "wei" | "kwei" | "mwei" | "gwei" | "szabo" | "finney" | "ether";

export type EnsLookupData = {
  ens?: string | null | undefined;
  address?: string | null | undefined;
};

export type EnsLookupCache = {
  forward: Record<string, EnsLookupState>;
  reverse: Record<string, EnsLookupState>;
};

export type EnsLookupState =
  | { type: typeof EnsLookupStates.EMPTY; data?: EnsLookupData }
  | { type: typeof EnsLookupStates.FETCHING; data?: EnsLookupData }
  | { type: typeof EnsLookupStates.ERROR; data?: EnsLookupData; error: EnsLookupErrors }
  | { type: typeof EnsLookupStates.NO_RESOLVE; data: EnsLookupData }
  | { type: typeof EnsLookupStates.SUCCESS; data: EnsLookupData };

export type GasPriceState =
  | { type: typeof GasPriceStates.EMPTY; data?: string }
  | { type: typeof GasPriceStates.FETCHING; data?: string }
  | { type: typeof GasPriceStates.ERROR; data?: undefined; error: GasePriceErrors }
  | { type: typeof GasPriceStates.SUCCESS; data: string };

export const initialEnsLookupState: EnsLookupState = {
  type: EnsLookupStates.EMPTY,
};

export const initiaGasPriceState: GasPriceState = {
  type: GasPriceStates.EMPTY,
};

export const initiaEnsLookupCache: EnsLookupCache = {
  forward: {},
  reverse: {},
};

export const ensLookupReducer = (state: EnsLookupState, action: EnsLookupState): EnsLookupState => {
  switch (action.type) {
    case EnsLookupStates.FETCHING:
      return { ...state, type: action.type };
    case EnsLookupStates.NO_RESOLVE:
    case EnsLookupStates.SUCCESS:
      return { ...state, type: action.type, data: action.data };
    case EnsLookupStates.ERROR:
      return { ...state, type: action.type, error: action.error };
    default:
      return { ...initialEnsLookupState, ...state };
  }
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
  (lookup: EnsLookupData, provider: ethers.providers.Provider, cache?: EnsLookupCache) =>
  async (dispatch: Dispatch<EnsLookupState>): Promise<void> => {
    dispatch({ type: EnsLookupStates.FETCHING });

    let promise: Promise<string | null>;
    let check: number;

    if (!!lookup.address) {
      check = 1;

      if (!!cache && !!cache.forward[lookup.address]) {
        promise = Promise.resolve(cache.forward[lookup.address].data?.ens ?? null);
      } else {
        promise = provider.lookupAddress(lookup.address);
      }
    } else if (!!lookup.ens) {
      check = 2;

      if (!!cache && !!cache.reverse[lookup.ens]) {
        promise = Promise.resolve(cache.forward[lookup.ens].data?.address ?? null);
      } else {
        promise = provider.resolveName(lookup.ens);
      }
    } else {
      promise = Promise.reject({ message: EnsLookupErrors.NO_DATA });
    }

    return promise.then(
      (result) => {
        let state: EnsLookupState;

        if (!result) {
          state = { type: EnsLookupStates.NO_RESOLVE, data: lookup };
        } else {
          const compile = { address: check === 2 ? result : lookup.address, ens: check === 1 ? result : lookup.ens };
          state = { type: EnsLookupStates.SUCCESS, data: compile };
        }

        dispatch(state);
      },
      (error) => {
        // Testing
        if (error.message.search("network does not support ENS") !== -1) {
          dispatch({ type: EnsLookupStates.NO_RESOLVE, data: lookup });
        } else {
          dispatch({ type: EnsLookupStates.ERROR, error: error.message });
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
