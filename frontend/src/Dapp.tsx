import React, { createContext, Dispatch, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { DAppProvider } from "@usedapp/core";
import { ethers } from "ethers";
//import WalletConnect from "@walletconnect/web3-provider";
//import WalletLink from "walletlink";
//import Web3Modal from "web3modal";

import * as Constants from "./Constants";
import { ethersConfig, dappNavLinks } from "./Data";
import { AppContext } from "./App";
import Header from "./layout/Header";
import DappNavigation from "./layout/DappNavigation";
import Footer from "./layout/Footer";
import {
  EnsLookupCache,
  EnsLookupState,
  EnsLookupStates,
  fetchAddress,
  initiaEnsLookupCache,
  initialEnsLookupState,
} from "./actions/Ethereum";

export const DappContext = createContext<{
  ethersProvider: ethers.providers.Provider;
  setEthersProvider: (value: ethers.providers.Provider) => void;
  activeAddress: EnsLookupState | undefined;
  setActiveAddress: (value: EnsLookupState | undefined) => void;
  userAddresses: EnsLookupState[];
  setUserAddresses: (value: EnsLookupState[]) => void;
  lookupUserAddress: (address: string, user: boolean) => EnsLookupState | undefined;
  resolveAddress: (address: string) => (dispatch: Dispatch<EnsLookupState>) => Promise<void>;
}>({
  ethersProvider: ethers.getDefaultProvider(),
  setEthersProvider: () => null,
  activeAddress: undefined,
  setActiveAddress: () => null,
  userAddresses: [],
  setUserAddresses: () => null,
  lookupUserAddress: () => undefined,
  resolveAddress: () => () =>
    new Promise(() => {
      return;
    }),
});

const Dapp: React.FunctionComponent = (): JSX.Element => {
  const appContext = useContext(AppContext);

  const [activeAddress, setActiveAddress] = useState<EnsLookupState | undefined>({
    ...initialEnsLookupState,
    ...(JSON.parse(localStorage.getItem("activeAddress") ?? "{}") as EnsLookupState),
  });
  const [userAddresses, setUserAddresses] = useState<EnsLookupState[]>(
    JSON.parse(localStorage.getItem("userAddresses") ?? "[]")
  );
  const [ensLookupCache, setEnsLookupCache] = useState<EnsLookupCache>(
    JSON.parse(localStorage.getItem("ensLookupCache") ?? JSON.stringify(initiaEnsLookupCache))
  );
  const [ethersProvider, setEthersProvider] = useState<ethers.providers.Provider>(
    new ethers.providers.InfuraProvider(Constants.DEFAULT_ETHERS_NETWORK, ethersConfig)
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

  const lookupUserAddress = (l: string): EnsLookupState | undefined => {
    for (let i = 0; i < userAddresses.length; i++) {
      if (userAddresses[i].data?.address === l) {
        return userAddresses[i];
      } else if (userAddresses[i].data?.ens === l) {
        return userAddresses[i];
      }
    }
  };

  const resolveAddress =
    (address: string) =>
    async (dispatch: Dispatch<EnsLookupState>): Promise<void> => {
      const forward = ensLookupCache.forward[address];
      const reverse = ensLookupCache.reverse[address];
      const addCacheAddress = (state: EnsLookupState) => {
        if (state.type === EnsLookupStates.SUCCESS || state.type === EnsLookupStates.NO_RESOLVE) {
          if (!!state.data.address) {
            ensLookupCache.forward = { ...ensLookupCache.forward, ...{ [state.data.address]: state } };
          }

          if (!!state.data.ens) {
            ensLookupCache.reverse = { ...ensLookupCache.reverse, ...{ [state.data.ens]: state } };
          }
          setEnsLookupCache(ensLookupCache);
        }

        dispatch(state);
      };

      let promise: Promise<void>;

      if (!!forward || !!reverse) {
        promise = Promise.resolve();
        dispatch(forward ?? reverse);
      } else {
        promise = new Promise(() => fetchAddress({ address: address }, ethersProvider)(addCacheAddress));
      }

      return promise;
    };

  const dappContext = {
    ethersProvider,
    setEthersProvider,
    activeAddress,
    setActiveAddress,
    userAddresses,
    setUserAddresses,
    lookupUserAddress,
    resolveAddress,
  };

  useEffect(() => {
    localStorage.setItem("ensLookupCache", JSON.stringify(ensLookupCache));
  }, [ensLookupCache]);

  useEffect(() => {
    localStorage.setItem("userAddresses", JSON.stringify(userAddresses));
  }, [userAddresses]);

  useEffect(() => {
    localStorage.setItem("activeAddress", JSON.stringify(activeAddress) ?? "{}");
  }, [activeAddress]);

  return (
    <DAppProvider config={Constants.DAPP_CONFIG}>
      <DappContext.Provider value={dappContext}>
        <Header>
          <DappNavigation links={activeAddress ? dappNavLinks : []} navState={appContext.navState} />
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

  @media screen and (max-height: 800px) {
    margin-bottom: 50px;
  }
`;
