import React, { createContext, Dispatch, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Currency, DAppProvider } from "@usedapp/core";
import { ethers } from "ethers";
//import WalletConnect from "@walletconnect/web3-provider";
//import WalletLink from "walletlink";
//import Web3Modal from "web3modal";

import * as Constants from "./Constants";
import { dappNavLinks, systemCurrencies } from "./Data";
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
  TokenLookupCache,
  initialTokenLookupCache,
  buildTokenCache,
  Networks,
  addAddressCache,
  AssetPortfolioCache,
  initialAssetPortfolioCache,
  AssetPortfolio,
  Address,
  PriceLookupCache,
  initialPriceLookupCache,
  FetchState,
  PriceData,
  FetchStates,
  buildPriceCache,
  Contract,
  TransactionCache,
  initialTransactionCache,
  Transaction,
} from "./actions/Network";
import { EthereumTokenStandards, fetchAddress as fetchEtherAddress, fetchTokens } from "./actions/Ethereum";
import { Symfoni } from "./hardhat/SymfoniContext";
import { BlockieState } from "./components/Blockies";
import { isCacheValid, localStoreOr, shortDisplayAddress, spliceOrArray } from "./utils/data-helpers";
import { useIsMounted } from "./utils/custom-hooks";
import { EtherscanProvider } from "@ethersproject/providers";

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
  SET_CURRENCY = "SET_CURRENCY",
  SET_ACTIVE_ADDRESS = "SET_ACTIVE_ADDRESS",
  ADD_USER_ADDRESS = "ADD_USER_ADDRESS",
  FOLLOW_ADDRESS = "FOLLOW_ADDRESS",
  UNFOLLOW_ADDRESS = "UNFOLLOW_ADDRESS",
  REMOVE_USER_ADDRESS = "REMOVE_USER_ADDRESS",
  RESOLVE_TOKEN_PRICES = "RESOLVE_TOKEN_PRICES",
  ADD_CACHE_ADDRESS = "ADD_CACHE_ADDRESS",
  ADD_CACHE_PORTFOLIO = "ADD_CACHE_PORTFOLIO",
  ADD_CACHE_PRICE = "ADD_CACHE_PRICE",
  ADD_CACHE_TRANSACTIONS = "ADD_CACHE_TRANSACTIONS",
}

enum InternalDappAction {
  RESOLVE_TOKENS = "RESOLVE_TOKENS",
  ACK_ADDED_ADDRESS = "ACK_ADDED_ADDRESS",
  ACK_REMOVED_ADDRESS = "ACK_REMOVED_ADDRESS",
  ACK_FOLLOWED_ADDRESS = "ACK_FOLLOWED_ADDRESS",
  ACK_UNFOLLOWED_ADDRESS = "ACK_UNFOLLOWED_ADDRESS",
  ACK_SWITCHED_PRIMARY_ADDRESS = "ACK_SWITCHED_PRIMARY_ADDRESS",
  ACK_DISCONNECTED = "ACK_DISCONNECTED",
}

enum DappEvent {
  LISTENING = "LISTENING",
  SYN_ADDED_ADDRESS = "SYN_ADDED_ADDRESS",
  SYN_REMOVED_ADDRESS = "SYN_REMOVED_ADDRESS",
  SYN_FOLLOWED_ADDRESS = "SYN_FOLLOWED_ADDRESS",
  SYN_UNFOLLOWED_ADDRESS = "SYN_UNFOLLOWED_ADDRESS",
  SYN_SWITCHED_PRIMARY_ADDRESS = "SYN_SWITCHED_PRIMARY_ADDRESS",
  SYN_DISCONNECTED = "SYN_DISCONNECTED",
}

export type DappEvents =
  | { type: DappEvent.LISTENING }
  | { type: DappEvent.SYN_ADDED_ADDRESS; address: NSLookupState }
  | { type: DappEvent.SYN_REMOVED_ADDRESS; address: NSLookupState }
  | { type: DappEvent.SYN_FOLLOWED_ADDRESS; address: Address }
  | { type: DappEvent.SYN_UNFOLLOWED_ADDRESS; address: Address }
  | { type: DappEvent.SYN_SWITCHED_PRIMARY_ADDRESS; curr: NSLookupState; prev: NSLookupState }
  | { type: DappEvent.SYN_DISCONNECTED };

export type DappActions =
  | { type: DappAction.DISCONNECT }
  | { type: DappAction.SET_CURRENCY; currency: Currency }
  | { type: DappAction.SET_ACTIVE_ADDRESS; address: NSLookupState }
  | { type: DappAction.ADD_USER_ADDRESS; address: NSLookupState }
  | { type: DappAction.REMOVE_USER_ADDRESS; address: number }
  | { type: DappAction.FOLLOW_ADDRESS; address: Address }
  | { type: DappAction.UNFOLLOW_ADDRESS; address: Address }
  | { type: DappAction.ADD_CACHE_ADDRESS; address: NSLookupState }
  | { type: DappAction.ADD_CACHE_PORTFOLIO; address: Address; portfolio: AssetPortfolio }
  | { type: DappAction.ADD_CACHE_TRANSACTIONS; address: Address; transactions: Transaction[] }
  | { type: DappAction.RESOLVE_TOKEN_PRICES; prices: FetchState<Record<Contract, PriceData>> }
  | { type: InternalDappAction.RESOLVE_TOKENS; tokens: FetchState<TokenData[]> }
  | { type: InternalDappAction.ACK_ADDED_ADDRESS }
  | { type: InternalDappAction.ACK_REMOVED_ADDRESS }
  | { type: InternalDappAction.ACK_SWITCHED_PRIMARY_ADDRESS }
  | { type: InternalDappAction.ACK_DISCONNECTED }
  | { type: InternalDappAction.ACK_FOLLOWED_ADDRESS }
  | { type: InternalDappAction.ACK_UNFOLLOWED_ADDRESS };

type DappState = {
  eventHost: DappEvents;
  userCurrency: Currency;
  userFollowing: Address[];
  userAddresses: NSLookupState[];
  activeAddress: NSLookupState;
  tokenLookupState: FetchState<TokenData[]>;
  tokenLookupCache: TokenLookupCache;
  priceLookupState: FetchState<Record<Contract, PriceData>>;
  priceLookupCache: PriceLookupCache;
  transactionCache: TransactionCache;
  nsLookupCache: NSLookupCache;
  addressPortfolioCache: AssetPortfolioCache;
};

const initialEventHost: DappEvents = {
  type: DappEvent.LISTENING,
};

const initialPriceLookupState: FetchState<Record<Contract, PriceData>> = {
  type: FetchStates.EMPTY,
};

const initialTokenLookupState: FetchState<TokenData[]> = {
  type: FetchStates.EMPTY,
};

const hardStateResets = {
  eventHost: initialEventHost,
  tokenLookupState: initialTokenLookupState,
  priceLookupState: initialPriceLookupState,
};

const initialDappState: DappState = localStoreOr("dappState", {
  userAddresses: [],
  userFollowing: [],
  userCurrency: systemCurrencies[Constants.DEFAULT_CURRENCY],
  addressPortfolioCache: initialAssetPortfolioCache,
  activeAddress: initialNSLookupState,
  tokenLookupCache: initialTokenLookupCache,
  priceLookupCache: initialPriceLookupCache,
  transactionCache: initialTransactionCache,
  nsLookupCache: initialNSLookupCache,
  ...hardStateResets,
});

const dappReducer = (state: DappState, action: DappActions): DappState => {
  let event: DappEvents;

  switch (action.type) {
    case DappAction.DISCONNECT:
      const disconnect = { activeAddress: initialNSLookupState, userAddresses: [] };
      event = { type: DappEvent.SYN_DISCONNECTED };
      return { ...state, ...disconnect, eventHost: event };
    case DappAction.SET_CURRENCY:
      return { ...state, userCurrency: action.currency };
    case DappAction.SET_ACTIVE_ADDRESS:
      event = { type: DappEvent.SYN_SWITCHED_PRIMARY_ADDRESS, curr: action.address, prev: state.activeAddress };
      return { ...state, eventHost: event, activeAddress: action.address };
    case DappAction.ADD_USER_ADDRESS:
      const addresses = Array.from(new Set([action.address, ...state.userAddresses]));
      event = { type: DappEvent.SYN_ADDED_ADDRESS, address: action.address };
      return { ...state, eventHost: event, userAddresses: addresses };
    case DappAction.FOLLOW_ADDRESS:
      event = { type: DappEvent.SYN_FOLLOWED_ADDRESS, address: action.address };
      return { ...state, eventHost: event, userFollowing: [...state.userFollowing, action.address] };
    case DappAction.UNFOLLOW_ADDRESS:
      event = { type: DappEvent.SYN_UNFOLLOWED_ADDRESS, address: action.address };
      return { ...state, eventHost: event, userFollowing: spliceOrArray(action.address, state.userFollowing) };
    case DappAction.REMOVE_USER_ADDRESS:
      const prunedAddress = state.userAddresses.splice(action.address, 1).pop();
      event = { type: DappEvent.SYN_ADDED_ADDRESS, address: prunedAddress ?? initialNSLookupState };
      return { ...state, eventHost: event, userAddresses: state.userAddresses };
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
      const portfolioCache = { [action.address]: { age: Date.now(), data: action.portfolio } };
      return { ...state, addressPortfolioCache: { ...state.addressPortfolioCache, ...portfolioCache } };
    case DappAction.ADD_CACHE_TRANSACTIONS:
      const transactionCache = { [action.address]: { age: Date.now(), data: action.transactions } };
      return { ...state, transactionCache: { ...state.transactionCache, ...transactionCache } };
    case DappAction.RESOLVE_TOKEN_PRICES:
      switch (action.prices.type) {
        case FetchStates.FETCHING:
        case FetchStates.ERROR:
          return { ...state, priceLookupState: action.prices };
        case FetchStates.SUCCESS:
          const priceCache = buildPriceCache(action.prices.data);
          return { ...state, priceLookupCache: priceCache };
        case FetchStates.EMPTY:
        default:
          return state;
      }
    case InternalDappAction.RESOLVE_TOKENS:
      switch (action.tokens.type) {
        case FetchStates.FETCHING:
        case FetchStates.ERROR:
          return { ...state, tokenLookupState: action.tokens };
        case FetchStates.SUCCESS:
          const cache = buildTokenCache(action.tokens.data);
          return { ...state, tokenLookupState: action.tokens, tokenLookupCache: cache };
        case FetchStates.EMPTY:
        default:
          return state;
      }
    case InternalDappAction.ACK_ADDED_ADDRESS:
    case InternalDappAction.ACK_REMOVED_ADDRESS:
    case InternalDappAction.ACK_SWITCHED_PRIMARY_ADDRESS:
    case InternalDappAction.ACK_DISCONNECTED:
    case InternalDappAction.ACK_FOLLOWED_ADDRESS:
    case InternalDappAction.ACK_UNFOLLOWED_ADDRESS:
      return { ...state, eventHost: { type: DappEvent.LISTENING } };
  }
};

export const DappContext = createContext<{
  ethersProvider: ethers.providers.Provider;
  etherScanProvider: EtherscanProvider;
  state: DappState;
  dispatch: Dispatch<DappActions>;
  lookupToken: (token: string) => TokenData | undefined;
  lookupUserAddress: (address: string, user: boolean) => NSLookupState | undefined;
  resolveAddress: (address: string, network: Networks) => (dispatch: React.Dispatch<NSLookupState>) => Promise<void>;
}>({
  ethersProvider: ethers.getDefaultProvider(),
  etherScanProvider: new ethers.providers.EtherscanProvider(),
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
  const [etherScanProvider] = useState<EtherscanProvider>(
    new ethers.providers.EtherscanProvider(Constants.DEFAULT_ETHERS_NETWORK, process.env.REACT_APP_ETHERSCAN_API_KEY)
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
    etherScanProvider,
    state,
    dispatch,
    lookupToken,
    lookupUserAddress,
    resolveAddress,
  };

  const setFirstAddressActive = useCallback(() => {
    if (!state.activeAddress.data && state.userAddresses.length > 0) {
      dispatch({
        type: DappAction.SET_ACTIVE_ADDRESS,
        address: state.userAddresses[state.userAddresses.length - 1],
      });
    }
  }, [state.activeAddress.data, state.userAddresses]);

  const resolveTokens = useCallback(async () => {
    switch (state.tokenLookupState.type) {
      case FetchStates.FETCHING:
      case FetchStates.ERROR:
        break;
      case FetchStates.SUCCESS:
        break;
      case FetchStates.EMPTY:
        if (!isCacheValid(state.tokenLookupCache.age, Constants.DEFAULT_REFRESH_INTERVAL)) {
          await fetchTokens(EthereumTokenStandards.ERC20)((state: FetchState<TokenData[]>) => {
            isMounted.current && dispatch({ type: InternalDappAction.RESOLVE_TOKENS, tokens: state });
          });
        }
    }
  }, [state.tokenLookupState.type, state.tokenLookupCache, isMounted]);

  const listenEventBus = useCallback(async () => {
    switch (state.eventHost.type) {
      case DappEvent.SYN_ADDED_ADDRESS:
        dispatch({ type: DappAction.ADD_CACHE_ADDRESS, address: state.eventHost.address });
        appContext.dispatch({
          type: AppAction.TOAST,
          message: `${t("notification.account_added")}${shortDisplayAddress(state.eventHost.address.data?.address)}`,
          toast: ToasterTypes.SUCCESS,
        });
        return dispatch({ type: InternalDappAction.ACK_ADDED_ADDRESS });
      case DappEvent.SYN_REMOVED_ADDRESS:
        appContext.dispatch({
          type: AppAction.TOAST,
          message: `${t("notification.account_removed")}${shortDisplayAddress(state.eventHost.address.data?.address)}`,
          toast: ToasterTypes.ERROR,
        });

        if (state.eventHost.address.data === state.activeAddress.data && state.userAddresses.length > 0) {
          dispatch({
            type: DappAction.SET_ACTIVE_ADDRESS,
            address: state.userAddresses[state.userAddresses.length - 1],
          });
        }
        return dispatch({ type: InternalDappAction.ACK_REMOVED_ADDRESS });
      case DappEvent.SYN_SWITCHED_PRIMARY_ADDRESS:
        appContext.dispatch({
          type: AppAction.TOAST,
          message: `${t("notification.account_switched")}${shortDisplayAddress(state.eventHost.curr.data?.address)}`,
          toast: ToasterTypes.SUCCESS,
        });
        return dispatch({ type: InternalDappAction.ACK_SWITCHED_PRIMARY_ADDRESS });
      case DappEvent.SYN_DISCONNECTED:
        appContext.dispatch({
          type: AppAction.TOAST,
          message: t("disconnected"),
          toast: ToasterTypes.ERROR,
        });
        return dispatch({ type: InternalDappAction.ACK_DISCONNECTED });
      case DappEvent.SYN_FOLLOWED_ADDRESS:
        appContext.dispatch({
          type: AppAction.TOAST,
          message: `${t("notification.address_followed")}${shortDisplayAddress(state.eventHost.address)}`,
          toast: ToasterTypes.SUCCESS,
        });
        return dispatch({ type: InternalDappAction.ACK_FOLLOWED_ADDRESS });
      case DappEvent.SYN_UNFOLLOWED_ADDRESS:
        appContext.dispatch({
          type: AppAction.TOAST,
          message: `${t("notification.address_unfollowed")}${shortDisplayAddress(state.eventHost.address)}`,
          toast: ToasterTypes.SUCCESS,
        });
        return dispatch({ type: InternalDappAction.ACK_UNFOLLOWED_ADDRESS });
      case DappEvent.LISTENING:
      default:
        return;
    }
  }, [appContext, state.activeAddress.data, state.eventHost, state.userAddresses, t]);

  useEffect(() => {
    setFirstAddressActive();
    resolveTokens();
    listenEventBus();
  }, [setFirstAddressActive, resolveTokens, listenEventBus]);

  useEffect(() => {
    localStorage.setItem("dappState", JSON.stringify(state));
  }, [state]);

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
  max-width: 100vw;
  height: calc(100% - var(--srvyr-footer-height));
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
