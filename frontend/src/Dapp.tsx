import React, { createContext, Dispatch, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { DAppProvider } from "@usedapp/core";
import { ethers } from "ethers";
//import WalletConnect from "@walletconnect/web3-provider";
//import WalletLink from "walletlink";
//import Web3Modal from "web3modal";

import * as Constants from "./Constants";
import { dappNavLinks } from "./Data";
import { AppAction, AppContext } from "./App";
import Header from "./layout/Header";
import DappNavigation from "./layout/DappNavigation";
import Footer from "./layout/Footer";
import {
  initialNSLookupState,
  initialNSLookupCache,
  NSLookupCache,
  NSLookupState,
  NSLookupStates,
  TokenData,
  TokenLookupState,
  initialTokenLookupState,
  TokenLookupCache,
  initialTokenLookupCache,
  TokenLookupStates,
  buildTokenCache,
  Networks,
  addAddressCache,
} from "./actions/Network";
import { EthereumTokenStandards, fetchAddress, fetchTokens } from "./actions/Ethereum";
import { BlockieState } from "./components/Blockies";
import { shortDisplayAddress } from "./utils/data-helpers";
import { ToasterTypes } from "./layout/Toaster";
import { useTranslation } from "react-i18next";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
  }
}

// TODO Find a better place for this
export const getBlockieState = (state: NSLookupStates) => {
  switch (state) {
    case NSLookupStates.EMPTY:
      return BlockieState.EMPTY;
    case NSLookupStates.ERROR:
      return BlockieState.ERROR;
    case NSLookupStates.FETCHING:
      return BlockieState.FETCHING;
    case NSLookupStates.NO_RESOLVE:
    case NSLookupStates.SUCCESS:
      return BlockieState.SUCCESS;
  }
};

export enum DappAction {
  TOAST,
  DISCONNECT,
  SET_ACTIVE_ADDRESS,
  ADD_USER_ADDRESS,
  RESOLVE_ADDRESS,
}

enum InternalDappAction {
  RESOLVE_TOKENS,
  ADD_CACHE_ADDRESS,
}

export type DappActions =
  | { type: DappAction.TOAST; toast: ToasterTypes; message: string }
  | { type: DappAction.DISCONNECT }
  | { type: DappAction.SET_ACTIVE_ADDRESS; address: NSLookupState }
  | { type: DappAction.ADD_USER_ADDRESS; address: NSLookupState }
  | { type: DappAction.RESOLVE_ADDRESS; address: NSLookupState }
  | { type: InternalDappAction.RESOLVE_TOKENS; tokens: TokenLookupState }
  | { type: InternalDappAction.ADD_CACHE_ADDRESS; address: NSLookupState };

type DappState = {
  activeAddress: NSLookupState;
  userAddresses: NSLookupState[];
  tokenLookupState: TokenLookupState;
  tokenLookupCache: TokenLookupCache;
  nsLookupCache: NSLookupCache;
};

const initialDappState: DappState = JSON.parse(localStorage.getItem("dappState") ?? "null") || {
  activeAddress: initialNSLookupState,
  userAddresses: [],
  tokenLookupState: initialTokenLookupState,
  tokenLookupCache: initialTokenLookupCache,
  nsLookupCache: initialNSLookupCache,
};

export const DappContext = createContext<{
  ethersProvider: ethers.providers.Provider;
  state: DappState;
  dispatch: Dispatch<DappActions>;
  lookupToken: (token: string) => TokenData | undefined;
  lookupUserAddress: (address: string, user: boolean) => NSLookupState | undefined;
  resolveAddress: (address: string) => (dispatch: Dispatch<NSLookupState>) => Promise<void>;
}>({
  ethersProvider: ethers.getDefaultProvider(),
  state: initialDappState,
  dispatch: () => null,
  lookupToken: () => undefined,
  lookupUserAddress: () => undefined,
  resolveAddress: () => () =>
    new Promise(() => {
      return;
    }),
});

const Dapp: React.FunctionComponent = (): JSX.Element => {
  const appContext = useContext(AppContext);
  const { t } = useTranslation();
  const dappReducer = (state: DappState, action: DappActions): DappState => {
    switch (action.type) {
      case DappAction.TOAST:
        appContext.dispatch({
          type: AppAction.TOAST,
          message: action.message,
          toast: action.toast,
        });
        return state;
      case DappAction.DISCONNECT:
        appContext.dispatch({
          type: AppAction.TOAST,
          message: t("disconnected"),
          toast: ToasterTypes.ERROR,
        });
        return { ...state, activeAddress: initialNSLookupState, userAddresses: [] };
      case DappAction.SET_ACTIVE_ADDRESS:
        appContext.dispatch({
          type: AppAction.TOAST,
          message: `${t("notification.account_switched")}${shortDisplayAddress(action.address.data?.address)}`,
          toast: ToasterTypes.SUCCESS,
        });
        return { ...state, activeAddress: action.address };
      case DappAction.ADD_USER_ADDRESS:
        appContext.dispatch({
          type: AppAction.TOAST,
          message: `${t("notification.account_added")}${shortDisplayAddress(action.address.data?.address)}`,
          toast: ToasterTypes.SUCCESS,
        });
        return { ...state, userAddresses: Array.from(new Set([action.address, ...state.userAddresses])) };
      case DappAction.RESOLVE_ADDRESS:
        return { ...state };
      case InternalDappAction.RESOLVE_TOKENS:
        switch (action.tokens.type) {
          case TokenLookupStates.FETCHING:
          case TokenLookupStates.ERROR:
            return { ...state, tokenLookupState: action.tokens };
          case TokenLookupStates.SUCCESS:
            return { ...state, tokenLookupState: action.tokens, tokenLookupCache: buildTokenCache(action.tokens.data) };
          case TokenLookupStates.EMPTY:
          default:
            return state;
        }
      case InternalDappAction.ADD_CACHE_ADDRESS:
        switch (action.address.type) {
          case NSLookupStates.SUCCESS:
          case NSLookupStates.NO_RESOLVE:
            return { ...state, nsLookupCache: addAddressCache(state.nsLookupCache, action.address.data) };
          case NSLookupStates.EMPTY:
          case NSLookupStates.FETCHING:
          case NSLookupStates.ERROR:
          default:
            return state;
        }
    }
  };

  const [state, dispatch] = useReducer(dappReducer, initialDappState);
  const [ethersProvider] = useState<ethers.providers.Provider>(
    process.env.NODE_ENV === "production"
      ? new ethers.providers.InfuraProvider(Constants.DEFAULT_ETHERS_NETWORK, Constants.DAPP_CONFIG)
      : new ethers.providers.Web3Provider(window.ethereum)
  );

  // Safety check
  ethersProvider.on("network", (newNetwork, oldNetwork) => {
    if (oldNetwork) {
      window.location.reload();
    }
  });

  // const getProviderOptions = () => {
  //   const infuraId = ethersConfig.infura;

  //   const providerOptions = {
  //     walletconnect: {
  //       package: WalletConnect,
  //       options: {
  //         infuraId,
  //       },
  //     },
  //     walletlink: {
  //       package: WalletLink,
  //       options: {
  //         appName: Constants.SITE_NAME,
  //         infuraId,
  //       },
  //     },
  //   };
  //   return providerOptions;
  // };

  // const web3Modal = new Web3Modal({
  //   network: Constants.DEFAULT_ETHERS_NETWORK,
  //   cacheProvider: true,
  //   providerOptions: getProviderOptions(),
  // });

  const lookupUserAddress = (l: string): NSLookupState | undefined => {
    for (let i = 0; i < state.userAddresses.length; i++) {
      if (state.userAddresses[i].data?.address === l) {
        return state.userAddresses[i];
      } else if (state.userAddresses[i].data?.ns === l) {
        return state.userAddresses[i];
      }
    }
  };

  const lookupToken = (token: string): TokenData | undefined => {
    if (state.tokenLookupCache.contract[token]) {
      return state.tokenLookupCache.contract[token];
    } else if (state.tokenLookupCache.symbol[token]) {
      return state.tokenLookupCache.symbol[token];
    } else if (state.tokenLookupCache.name[token]) {
      return state.tokenLookupCache.name[token];
    }
  };

  const getAllTokens = (network: Networks): TokenData[] => {
    return state.tokenLookupCache.network[network];
  };

  const resolveTokens = useCallback(() => {
    if (
      state.tokenLookupState.type !== TokenLookupStates.FETCHING &&
      state.tokenLookupCache.age < Date.now() - Constants.DEFAULT_REFRESH_INTERVAL
    ) {
      fetchTokens(EthereumTokenStandards.ERC20.toString())((state: TokenLookupState) => {
        dispatch({ type: InternalDappAction.RESOLVE_TOKENS, tokens: state });
      });
    }
  }, [state.tokenLookupState.type, state.tokenLookupCache]);

  const resolveAddress =
    (address: string) =>
    async (localDispatch: Dispatch<NSLookupState>): Promise<void> => {
      const forward = state.nsLookupCache.forward[address];
      const reverse = state.nsLookupCache.reverse[address];

      let promise: Promise<void>;

      if (!!forward || !!reverse) {
        promise = Promise.resolve();
        localDispatch({ type: NSLookupStates.SUCCESS, data: forward ?? reverse });
      } else {
        promise = new Promise(() =>
          fetchAddress(
            { network: Networks.ETHEREUM, address: address },
            ethersProvider
          )((state: NSLookupState) => {
            dispatch({ type: InternalDappAction.ADD_CACHE_ADDRESS, address: state });
            localDispatch(state);
          })
        );
      }

      return promise;
    };

  const dappContext = {
    ethersProvider,
    state,
    dispatch,
    lookupToken,
    lookupUserAddress,
    resolveAddress,
  };

  useEffect(() => {
    resolveTokens();
  }, [resolveTokens]);

  useEffect(() => {
    localStorage.setItem("dappState", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.userAddresses.length > 0 && !state.activeAddress?.data) {
      dispatch({
        type: DappAction.SET_ACTIVE_ADDRESS,
        address: state.userAddresses[state.userAddresses.length - 1],
      });
    }
  }, [state.userAddresses, state.activeAddress]);

  return (
    <DAppProvider config={Constants.DAPP_CONFIG}>
      <DappContext.Provider value={dappContext}>
        <Header>
          <DappNavigation links={state.activeAddress ? dappNavLinks : []} navState={appContext.navState} />
        </Header>
        <MainStyle>
          <Outlet />
        </MainStyle>
        <Footer />
      </DappContext.Provider>
    </DAppProvider>
  );
};

export default Dapp;

const MainStyle = styled.main`
  flex-basis: 100%;
  height: calc(100vh - var(--srvyr-footer-height));
  left: 0;
  background-size: cover;
  padding: 15px;
  flex-grow: 1;

  @media (min-width: 993px) {
    padding-left: calc(var(--srvyr-header-width) + 20px);
    padding-right: 30px;
  }

  @media screen and (max-width: 992px) {
    padding-top: 75px;
  }
`;
