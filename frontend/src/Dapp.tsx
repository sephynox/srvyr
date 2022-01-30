import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import styled from "styled-components";
import { DAppProvider } from "@usedapp/core";
//import WalletConnect from "@walletconnect/web3-provider";
//import WalletLink from "walletlink";
//import Web3Modal from "web3modal";

import * as Constants from "./Constants";
import { EnsLookupState, initialEnsLookupState } from "./actions/Ethereum";
import Header from "./layout/Header";
import DappNavigation from "./layout/DappNavigation";
import Footer from "./layout/Footer";
import { ethersConfig, dappNavLinks } from "./Data";
//import Routes from "./dapp/Routes";
import { ethers } from "ethers";
import { AppContext } from "./App";

export const DappContext = createContext<{
  ethersProvider: ethers.providers.Provider;
  setEthersProvider: (value: ethers.providers.Provider) => void;
  activeAddress: EnsLookupState | undefined;
  setActiveAddress: (value: EnsLookupState | undefined) => void;
  userAddresses: EnsLookupState[];
  setUserAddresses: (value: EnsLookupState[]) => void;
  resolveAddress: (address: string) => EnsLookupState | undefined;
}>({
  ethersProvider: ethers.getDefaultProvider(),
  setEthersProvider: () => null,
  activeAddress: undefined,
  setActiveAddress: () => null,
  userAddresses: [],
  setUserAddresses: () => null,
  resolveAddress: () => undefined,
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
  const [ethersProvider, setEthersProvider] = useState<ethers.providers.Provider>(
    new ethers.providers.InfuraProvider(Constants.DEFAULT_ETHERS_NETWORK, ethersConfig)
  );

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

  const resolveAddress = (l: string): EnsLookupState | undefined => {
    for (let i = 0; i < dappContext.userAddresses.length; i++) {
      if (dappContext.userAddresses[i].data?.address === l) {
        return dappContext.userAddresses[i];
      } else if (dappContext.userAddresses[i].data?.ens === l) {
        return dappContext.userAddresses[i];
      }
    }
  };

  const dappContext = {
    ethersProvider,
    setEthersProvider,
    activeAddress,
    setActiveAddress,
    userAddresses,
    setUserAddresses,
    resolveAddress,
  };

  useEffect(() => {
    setActiveAddress(userAddresses[userAddresses.length - 1]);
    userAddresses.length > 0 && localStorage.setItem("userAddresses", JSON.stringify(userAddresses));
  }, [userAddresses]);

  useEffect(() => {
    activeAddress && localStorage.setItem("activeAddress", JSON.stringify(activeAddress));
  }, [activeAddress]);

  return (
    <DAppProvider config={Constants.DAPP_CONFIG}>
      <BrowserRouter>
        <DappContext.Provider value={dappContext}>
          <Header>
            <DappNavigation links={dappNavLinks} navState={appContext.navState} />
          </Header>
          <MainStyle>{/* <Routes /> */}</MainStyle>
          <Footer />
        </DappContext.Provider>
      </BrowserRouter>
    </DAppProvider>
  );
};

export default Dapp;

const MainStyle = styled.main`
  flex-basis: 100%;
  height: calc(100vh - var(--srvyr-footer-height));
  left: 0;
  background-size: cover;
  padding: 0 0 0 15px;
  flex-grow: 1;

  @media (min-width: 993px) {
    padding-left: var(--srvyr-header-width);
    padding-right: 30px;
  }

  @media screen and (max-width: 992px) {
    padding: 0 0 0 15px;
  }

  @media screen and (max-height: 800px) {
    margin-bottom: 50px;
  }
`;
