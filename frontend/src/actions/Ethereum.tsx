import { ethers } from "ethers";
import { Dispatch } from "react";

export const REGEX_ETHEREUM_ADDRESS = "/^0x[a-fA-F0-9]{40}$/";

export enum EnsLookupErrors {
  NO_ENS_SET = "No ENS set for address.",
  NO_DATA = "No lookup data provided",
}

export enum EnsLookupStates {
  EMPTY,
  FETCHING,
  ERROR,
  NO_RESOLVE,
  SUCCESS,
}

export type EnsLookupData = {
  ens?: string | null | undefined;
  address?: string | null | undefined;
};

// TODO
export type EnsLookupCache = {
  forward: Record<string, EnsLookupData>;
  reverse: Record<string, EnsLookupData>;
};

export type EnsLookupState =
  | { type: typeof EnsLookupStates.EMPTY; data?: EnsLookupData }
  | { type: typeof EnsLookupStates.FETCHING; data?: EnsLookupData }
  | { type: typeof EnsLookupStates.ERROR; data?: EnsLookupData; error: EnsLookupErrors }
  | { type: typeof EnsLookupStates.NO_RESOLVE; data: EnsLookupData }
  | { type: typeof EnsLookupStates.SUCCESS; data: EnsLookupData };

export const initialEnsLookupState: EnsLookupState = {
  type: EnsLookupStates.EMPTY,
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
      return { ...state, ...EnsLookupStates };
  }
};

export const fetchAddress =
  (lookup: EnsLookupData, provider: ethers.providers.Provider) =>
  async (dispatch: Dispatch<EnsLookupState>): Promise<void> => {
    dispatch({ type: EnsLookupStates.FETCHING });

    let promise: Promise<string | null>;
    let check: number;

    if (!!lookup.address) {
      check = 1;
      promise = provider.lookupAddress(lookup.address);
    } else if (!!lookup.ens) {
      check = 2;
      promise = provider.resolveName(lookup.ens);
    } else {
      promise = Promise.reject({ message: EnsLookupErrors.NO_DATA });
    }

    return promise.then(
      (result) => {
        if (!result) {
          dispatch({ type: EnsLookupStates.NO_RESOLVE, data: lookup });
        } else {
          const data = { address: check === 2 ? result : lookup.address, ens: check === 1 ? result : lookup.ens };
          dispatch({ type: EnsLookupStates.SUCCESS, data: data });
        }
      },
      (error) => dispatch({ type: EnsLookupStates.ERROR, error: error.message })
    );
  };
