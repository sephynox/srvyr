import React, { createContext, Dispatch, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { ToasterTypes } from "./layout/Toaster";
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
  AssetPortfolioCache,
  initialAssetPortfolioCache,
  AssetPortfolio,
  Address,
} from "./actions/Network";
import { EthereumTokenStandards, fetchAddress as fetchEtherAddress, fetchTokens } from "./actions/Ethereum";
import { Symfoni } from "./hardhat/SymfoniContext";
import { BlockieState } from "./components/Blockies";
import { isCacheValid, shortDisplayAddress } from "./utils/data-helpers";
import { useIsMounted, usePrevious } from "./utils/custom-hooks";

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
  DISCONNECT = "DISCONNECT",
  SET_ACTIVE_ADDRESS = "SET_ACTIVE_ADDRESS",
  ADD_USER_ADDRESS = "ADD_USER_ADDRESS",
  REMOVE_USER_ADDRESS = "REMOVE_USER_ADDRESS",
  ADD_CACHE_ADDRESS = "ADD_CACHE_ADDRESS",
  ADD_CACHE_PORTFOLIO = "ADD_CACHE_PORTFOLIO",
}

enum InternalDappAction {
  RESOLVE_TOKENS = "RESOLVE_TOKENS",
  ACK_ADDED_ADDRESS = "ACK_ADDED_ADDRESS",
  ACK_REMOVED_ADDRESS = "ACK_REMOVED_ADDRESS",
  ACK_DISCONNECT_ALERTED = "ACK_DISCONNECT_ALERTED",
}

export type DappActions =
  | { type: DappAction.DISCONNECT }
  | { type: DappAction.SET_ACTIVE_ADDRESS; address: NSLookupState }
  | { type: DappAction.ADD_USER_ADDRESS; address: NSLookupState }
  | { type: DappAction.REMOVE_USER_ADDRESS; address: number }
  | { type: DappAction.ADD_CACHE_ADDRESS; address: NSLookupState }
  | { type: DappAction.ADD_CACHE_PORTFOLIO; address: Address; portfolio: AssetPortfolio }
  | { type: InternalDappAction.RESOLVE_TOKENS; tokens: TokenLookupState }
  | { type: InternalDappAction.ACK_ADDED_ADDRESS }
  | { type: InternalDappAction.ACK_REMOVED_ADDRESS }
  | { type: InternalDappAction.ACK_DISCONNECT_ALERTED };

type DappState = {
  alertDisconnected: boolean;
  userAddresses: NSLookupState[];
  removedAddress: NSLookupState | undefined;
  addedAddress: NSLookupState | undefined;
  activeAddress: NSLookupState;
  tokenLookupState: TokenLookupState;
  tokenLookupCache: TokenLookupCache;
  nsLookupCache: NSLookupCache;
  addressPortfolioCache: AssetPortfolioCache;
};

const hardStateResets = {
  alertDisconnected: false,
  addedAddress: undefined,
  tokenLookupState: initialTokenLookupState,
};

const initialDappState: DappState = JSON.parse(localStorage.getItem("dappState") ?? "null") || {
  userAddresses: [],
  addressPortfolioCache: initialAssetPortfolioCache,
  activeAddress: initialNSLookupState,
  tokenLookupCache: initialTokenLookupCache,
  nsLookupCache: initialNSLookupCache,
  ...hardStateResets,
};

const dappReducer = (state: DappState, action: DappActions): DappState => {
  switch (action.type) {
    case DappAction.DISCONNECT:
      return { ...state, alertDisconnected: true, activeAddress: initialNSLookupState, userAddresses: [] };
    case DappAction.SET_ACTIVE_ADDRESS:
      return { ...state, activeAddress: action.address };
    case DappAction.ADD_USER_ADDRESS:
      const addresses = Array.from(new Set([action.address, ...state.userAddresses]));
      return { ...state, addedAddress: action.address, userAddresses: addresses };
    case DappAction.REMOVE_USER_ADDRESS:
      const prunedAddress = state.userAddresses.splice(action.address, 1).pop();
      return { ...state, removedAddress: prunedAddress, userAddresses: state.userAddresses };
    case DappAction.ADD_CACHE_ADDRESS:
      switch (action.address.type) {
        case NSLookupStates.SUCCESS:
        case NSLookupStates.NO_RESOLVE:
          const cache = addAddressCache(state.nsLookupCache, action.address.data);
          return { ...state, nsLookupCache: cache };
        case NSLookupStates.EMPTY:
        case NSLookupStates.FETCHING:
        case NSLookupStates.ERROR:
        default:
          return state;
      }
    case DappAction.ADD_CACHE_PORTFOLIO:
      const cache = { [action.address]: { age: Date.now(), data: action.portfolio } };
      return { ...state, addressPortfolioCache: { ...state.addressPortfolioCache, ...cache } };
    case InternalDappAction.RESOLVE_TOKENS:
      switch (action.tokens.type) {
        case TokenLookupStates.FETCHING:
        case TokenLookupStates.ERROR:
          return { ...state, tokenLookupState: action.tokens };
        case TokenLookupStates.SUCCESS:
          const cache = buildTokenCache(action.tokens.data);
          return { ...state, tokenLookupState: action.tokens, tokenLookupCache: cache };
        case TokenLookupStates.EMPTY:
        default:
          return state;
      }
    case InternalDappAction.ACK_ADDED_ADDRESS:
      return { ...state, addedAddress: undefined };
    case InternalDappAction.ACK_REMOVED_ADDRESS:
      return { ...state, removedAddress: undefined };
    case InternalDappAction.ACK_DISCONNECT_ALERTED:
      return { ...state, alertDisconnected: false };
  }
};

export const DappContext = createContext<{
  ethersProvider: ethers.providers.Provider;
  state: DappState;
  dispatch: Dispatch<DappActions>;
  lookupToken: (token: string) => TokenData | undefined;
  lookupUserAddress: (address: string, user: boolean) => NSLookupState | undefined;
  resolveAddress: (address: string, network: Networks) => (dispatch: React.Dispatch<NSLookupState>) => Promise<void>;
}>({
  ethersProvider: ethers.getDefaultProvider(),
  state: initialDappState,
  dispatch: () => null,
  lookupToken: () => undefined,
  lookupUserAddress: () => undefined,
  resolveAddress: () => () => Promise.reject(),
});

const Dapp: React.FunctionComponent = (): JSX.Element => {
  const appContext = useContext(AppContext);
  const { t } = useTranslation();

  const isMounted = useIsMounted();
  const [state, dispatch] = useReducer(dappReducer, { ...initialDappState, ...hardStateResets });
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

  const resolveAddress = (address: string, network: Networks) => {
    switch (network) {
      case Networks.ETHEREUM:
        const action = { network: Networks.ETHEREUM, address: address };
        return fetchEtherAddress(action, ethersProvider, state.nsLookupCache);
    }
  };

  const dappContext = {
    ethersProvider,
    state,
    dispatch,
    lookupToken,
    lookupUserAddress,
    resolveAddress,
  };

  const prevAddress = usePrevious(state.activeAddress);

  const setFirstAddressActive = useCallback(() => {
    if (!state.activeAddress.data && state.userAddresses.length > 0) {
      dispatch({
        type: DappAction.SET_ACTIVE_ADDRESS,
        address: state.userAddresses[state.userAddresses.length - 1],
      });
    }
  }, [state.activeAddress.data, state.userAddresses]);

  const notifyAccountChanges = useCallback(() => {
    if (state.addedAddress?.data) {
      dispatch({ type: DappAction.ADD_CACHE_ADDRESS, address: state.addedAddress });
      dispatch({ type: InternalDappAction.ACK_ADDED_ADDRESS });
      appContext.dispatch({
        type: AppAction.TOAST,
        message: `${t("notification.account_added")}${shortDisplayAddress(state.addedAddress.data.address)}`,
        toast: ToasterTypes.SUCCESS,
      });
    } else if (state.removedAddress) {
      dispatch({ type: InternalDappAction.ACK_REMOVED_ADDRESS });
      appContext.dispatch({
        type: AppAction.TOAST,
        message: `${t("notification.account_removed")}${shortDisplayAddress(state.removedAddress.data?.address)}`,
        toast: ToasterTypes.ERROR,
      });

      if (state.removedAddress.data === state.activeAddress.data && state.userAddresses.length > 0) {
        dispatch({
          type: DappAction.SET_ACTIVE_ADDRESS,
          address: state.userAddresses[state.userAddresses.length - 1],
        });
      }
    } else if (state.alertDisconnected) {
      dispatch({ type: InternalDappAction.ACK_DISCONNECT_ALERTED });
      appContext.dispatch({
        type: AppAction.TOAST,
        message: t("disconnected"),
        toast: ToasterTypes.ERROR,
      });
    } else if (prevAddress?.data?.address && state.activeAddress.data?.address !== prevAddress?.data?.address) {
      appContext.dispatch({
        type: AppAction.TOAST,
        message: `${t("notification.account_switched")}${shortDisplayAddress(state.activeAddress.data?.address)}`,
        toast: ToasterTypes.SUCCESS,
      });
    }
  }, [
    t,
    appContext,
    prevAddress,
    state.addedAddress,
    state.removedAddress,
    state.alertDisconnected,
    state.activeAddress,
    state.userAddresses,
  ]);

  const resolveTokens = useCallback(async () => {
    if (
      state.tokenLookupState.type !== TokenLookupStates.FETCHING &&
      !isCacheValid(state.tokenLookupCache.age, Constants.DEFAULT_REFRESH_INTERVAL)
    ) {
      await fetchTokens(EthereumTokenStandards.ERC20.toString())((state: TokenLookupState) => {
        isMounted.current && dispatch({ type: InternalDappAction.RESOLVE_TOKENS, tokens: state });
      });
    }
  }, [state.tokenLookupState.type, state.tokenLookupCache, isMounted]);

  useEffect(() => {
    setFirstAddressActive();
    resolveTokens();
  }, [setFirstAddressActive, resolveTokens, notifyAccountChanges]);

  useEffect(() => {
    notifyAccountChanges();
    localStorage.setItem("dappState", JSON.stringify(state));
  }, [state, notifyAccountChanges]);

  return (
    <DAppProvider config={Constants.DAPP_CONFIG}>
      <DappContext.Provider value={dappContext}>
        <Header>
          <DappNavigation links={state.activeAddress ? dappNavLinks : []} navState={appContext.state.navState} />
        </Header>
        <Symfoni>
          <MainStyle>
            <Outlet />
          </MainStyle>
        </Symfoni>
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
